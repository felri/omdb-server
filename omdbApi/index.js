const fetch = require("node-fetch");

const getTvShowByName = async search => {
  const response = await fetch(`${process.env.BASE_URL}?t=${search}&type=series${process.env.API_KEY}`)
  return await response.json()
}

const getEpisodesByTvShowIdOmdb = async ({ imdbID, totalSeasons = 1 }) => {
  const episodes = []

  for (let season = 1; season < totalSeasons; season++) {
    const query = `${process.env.BASE_URL}?i=${imdbID}&season=${season}${process.env.API_KEY}`
    console.log(query)
    const response = await fetch(query)
    const data = await response.json()
    if (data.Response === 'True' && data.Episodes.length > 0)
      for (let i = 0; i < data.Episodes.length; i++) {
        let episode = { ...data.Episodes[i] }
        episode.Season = season
        if (episode.imdbRating !== 'N/A')
          episodes.push(episode)
      }
  }

  return episodes
}

module.exports = {
  getTvShowByName,
  getEpisodesByTvShowIdOmdb
}