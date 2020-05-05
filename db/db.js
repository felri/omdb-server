const Pool = require('pg').Pool
const pool = new Pool({
  user: 'me',
  host: 'localhost',
  database: 'omdb',
  password: '2181924@@',
  port: 5432,
})

module.exports = {
  pool
}