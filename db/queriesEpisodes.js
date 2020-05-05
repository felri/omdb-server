const db = require('./db.js')

const getEpisodes = (request, response) => {
  db.pool.query('SELECT * FROM episodes ORDER BY id ASC', (error, results) => {
    if (error) {
      throw error
    }
    response.status(200).json(results.rows)
  })
}

const getEpisodeById = (request, response) => {
  const id = parseInt(request.params.id)

  db.pool.query(`SELECT * FROM episodes WHERE id = ${id}`, (error, results) => {
    if (error) {
      throw error
    }
    response.status(200).json(results.rows)
  })
}

const getEpisodesByTvshowId = async id => {
  return await db.pool.query(`SELECT * FROM episodes WHERE tvid = ${id}`)
}

const createEpisode = async data => {
  const { Title, tvid, imdbRating, Released, imdbID, Season, Episode } = data

  const query = `
    INSERT INTO episodes (title, tvid, imdbrating, released, imdbId, season, episode) 
    VALUES ('${Title.replace(/'/g, "")}', 
    ${tvid}, 
    ${parseFloat(imdbRating)}, 
    '${Released}', 
    '${imdbID}', 
    ${Season}, 
    ${parseInt(Episode)})
    RETURNING *
  `

  const results = await db.pool.query(query)
  return results.rows[0]
}

const updateEpisode = (request, response) => {
  const id = parseInt(request.params.id)
  const { Title, imdbRating, Released, imdbID, Season, Episode } = request.body

  const query = `
    UPDATE episodes SET 
    title = '${Title.replace(/'/g, "")}', 
    imdbrating = ${parseFloat(imdbRating)}, 
    released = '${Released}', 
    imdbId = '${imdbID}', 
    season = ${Season}, 
    episode = ${parseInt(Episode)}
    WHERE id = ${id} 
    RETURNING *
  `

  db.pool.query(query,
    (error, results) => {
      if (error) {
        throw error
      }
      response.status(200).send(results.rows[0])
    }
  )
}

const deleteEpisode = (request, response) => {
  const id = parseInt(request.params.id)

  db.pool.query(`DELETE FROM episodes WHERE id = ${id}`, (error, results) => {
    if (error) {
      throw error
    }
    response.status(200).send(`Tvshow deleted with ID: ${id}`)
  })
}

module.exports = {
  getEpisodes,
  getEpisodeById,
  getEpisodesByTvshowId,
  createEpisode,
  updateEpisode,
  deleteEpisode
}