const express = require('express')
require('dotenv').config()
const cors = require('cors');
const bodyParser = require('body-parser')
const app = express()
const dbTvshows = require('./db/queriesTvshows')

const port = 3234

app.use(cors())
app.use(bodyParser.json())
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
)

app.get('/findtvshow', dbTvshows.findTvshowByName)
app.get('/getsuggestions', dbTvshows.getSugestionsTvshows)
app.get('/tvshows', dbTvshows.getTvshows)
app.delete('/tvshows/:id', dbTvshows.deleteTvshow)
app.delete('/tvshows/all', dbTvshows.cleanDb)
app.get('/populateDb', dbTvshows.populateDb)

app.listen(port, () => {
  console.log(`App running on port ${port}.`)
})

