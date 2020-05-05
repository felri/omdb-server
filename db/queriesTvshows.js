const db = require('./db.js')
const dbEpisodes = require('./queriesEpisodes')
const omdbApi = require('../omdbApi')

const getTvshows = (request, response) => {
  db.pool.query('SELECT * FROM tvshows ORDER BY id ASC', (error, results) => {
    if (error) {
      throw error
    }
    response.status(200).json(results.rows)
  })
}

const getEpisodesFromOmdbAndSave = async ({ imdbID, totalSeasons, tvid }) => {
  let episodesOmdb = []
  // GET ALL EPISODES FROM IMDB
  episodesOmdb = await omdbApi.getEpisodesByTvShowIdOmdb({ imdbID, totalSeasons })
  let savedEpisodes = []
  for (let i = 0; i < episodesOmdb.length; i++) {
    //SAVE ALL EPISODES FROM OMDB 
    const episode = await dbEpisodes.createEpisode({ ...episodesOmdb[i], tvid })
    savedEpisodes.push(episode)
  }
  return savedEpisodes
}

const checkIfShowsNeedUpdate = ({ tvshow }) => {
  //return if lastupdate was older than 7 days
  const date = new Date(tvshow.lastupdate)
  date.setDate(date.getDate() + 1)
  return date < new Date()
}

const getTvShowAndEpisodesFromDb = async ({ search }) => {
  let results = await db.pool.query(`SELECT * FROM tvshows WHERE LOWER(title) LIKE LOWER('${'%' + search + '%'}')`)
  if (results.rows.length > 0) {
    const episodes = await db.pool.query(`SELECT * FROM episodes WHERE tvid = ${results.rows[0].id}`)
    return { tvshow: results.rows[0], episodes: episodes.rows }
  }
}

const handleUpdateEpisodesFromOmdb = async ({ tvshow }) => {
  const date = new Date()
  try {
    // DELETE OLD EPISODES FROM DB
    await db.pool.query(`DELETE FROM episodes WHERE tvid = ${tvshow.id}`)
  } catch (e) {
    console.log('error during deletion episodes', e)
  }
  try {
    // UPDATE FIELD lastupdate TVSHOW
    await db.pool.query(`UPDATE tvshows SET lastupdate = '${date.toUTCString()}' WHERE ID = ${tvshow.id}`)
  } catch (e) {
    console.log('error during update lastupdate', e)
  }
  try {
    // GET EPISODES FROM OMDB, SAVE AND RETURN IT
    const episodes = await getEpisodesFromOmdbAndSave({ imdbID: tvshow.imdbid, totalSeasons: tvshow.totalseasons, tvid: tvshow.id })
    return episodes
  } catch (e) {
    console.log('error during getting new episodes update', e)
    const episodes = await handleUpdateEpisodesFromOmdb({ imdbID: tvshow.imdbid, tvid: tvshow.id })
    return episodes
  }
}

const findTvshowByName = async (request, response) => {
  const search = request.query.search
  if (search.length > 3) {
    const data = await getTvShowAndEpisodesFromDb({ search })
    if (data && data.tvshow && data.tvshow.id) {
      if (checkIfShowsNeedUpdate({ tvshow: data.tvshow })) {
        const episodes = await handleUpdateEpisodesFromOmdb({ tvshow: data.tvshow })
        response.status(200).json({ tvshow: data.tvshow, episodes })
      } else {
        response.status(200).json(data)
      }
    }
    else {
      results = await omdbApi.getTvShowByName(search)
      //if exists result from OMDB
      if (results.Response === 'True') {
        const tvshow = await createTvshow(results)
        const savedEpisodes = await getEpisodesFromOmdbAndSave({ imdbID: results.imdbID, totalSeasons: results.totalSeasons, tvid: tvshow.rows[0].id })
        const data = {
          tvshow: tvshow.rows[0],
          episodes: savedEpisodes
        }
        response.status(200).json(data)
      }
      else response.status(400).json(results)
    }
  } else response.status(400).json({ response: false, message: 'Request too short' })
}

const createTvshow = async (data) => {
  const { Title, Year, Plot, imdbRating, imdbVotes, imdbID, Poster, totalSeasons } = data

  const date = new Date()

  const query = `
    INSERT INTO tvshows (title, year, plot, imdbrating, imdbVotes, imdbId, poster, lastupdate, totalseasons) 
    VALUES ('${Title.replace(/'/g, "")}', 
    '${Year}', 
    '${Plot.replace(/'/g, "")}', 
    ${parseFloat(imdbRating)}, 
    ${parseInt(imdbVotes)}, 
    '${imdbID}',
    '${Poster}',
    '${date.toUTCString()}',
    ${parseInt(totalSeasons)})
    RETURNING *
  `
  return await db.pool.query(query)
}

const getShowById = async (request, response) => {
  const id = parseInt(request.params.id)

  const tvshow = await db.pool.query(`SELECT * FROM tvshows WHERE id = ${id}`)
  let episodes = []
  if (tvshow && tvshow.rows && tvshow.rows.length > 0) episodes = await dbEpisodes.getEpisodesByTvshowId(tvshow.rows[0].id)
  response.status(200).json({ tvshow: tvshow.rows[0], episodes: episodes.rows })
}

const updateTvshow = (request, response) => {
  const id = parseInt(request.params.id)
  const { Title, Year, Plot, imdbRating, imdbVotes, imdbID, Poster, totalSeasons } = request.body

  const query = `
    UPDATE tvshows SET 
    title = '${Title.replace(/'/g, "")}', 
    year = '${Year}',
    plot = '${Plot.replace(/'/g, "")}',
    imdbrating = ${parseFloat(imdbRating)}, 
    imdbVotes = ${parseInt(imdbVotes)}, 
    imdbId = '${imdbID}', 
    poster= '${Poster}',
    totalseasons= ${parseInt(totalSeasons)}

    WHERE id = ${id} 
    RETURNING *
  `

  console.log(query)

  db.pool.query(query,
    (error, results) => {
      if (error) {
        throw error
      }
      response.status(200).send(results.rows[0])
    }
  )
}

const deleteTvshow = (request, response) => {
  const id = parseInt(request.params.id)

  db.pool.query(`DELETE FROM tvshows WHERE id = ${id}`, (error, results) => {
    if (error) {
      throw error
    }
    response.status(200).send(`Tvshow deleted with ID: ${id}`)
  })
}

module.exports = {
  getTvshows,
  getShowById,
  createTvshow,
  updateTvshow,
  findTvshowByName,
  deleteTvshow
}