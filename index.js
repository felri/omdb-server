const express = require('express')
require('dotenv').config()
const bodyParser = require('body-parser')
const app = express()
const dbTvshows = require('./db/queriesTvshows')
const dbEpisodes = require('./db/queriesEpisodes')

const port = 3001

app.use(bodyParser.json())
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
)

app.get('/findtvshow', dbTvshows.findTvshowByName)
app.get('/tvshows', dbTvshows.getTvshows)
app.get('/tvshows/:id', dbTvshows.getShowById)
app.post('/tvshows', dbTvshows.createTvshow)
app.put('/tvshows/:id', dbTvshows.updateTvshow)
app.delete('/tvshows/:id', dbTvshows.deleteTvshow)

app.get('/episodes', dbEpisodes.getEpisodes)
app.get('/episodes/:id', dbEpisodes.getEpisodeById)
app.post('/episodes', dbEpisodes.createEpisode)
app.put('/episodes/:id', dbEpisodes.updateEpisode)
app.delete('/episodes/:id', dbEpisodes.deleteEpisode)

app.listen(port, () => {
  console.log(`App running on port ${port}.`)
})