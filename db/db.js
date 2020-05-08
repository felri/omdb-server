const Pool = require('pg').Pool
const pool = new Pool({
  user: process.env.USERNAME_DB,
  host: 'localhost',
  database: 'omdb',
  password: process.env.PASSWORD,
  port: 5432,
})

module.exports = {
  pool
}