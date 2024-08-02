require('dotenv').config();
const pg = require("pg");

const pool = new pg.Pool({
  connectionString: process.env.CONNECTION_STRING,
});

module.exports = { pool }