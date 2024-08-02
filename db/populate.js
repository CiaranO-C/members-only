//require("dotenv").config();
const pg = require("pg");

const client = new pg.Client({
  connectionString: process.env.CONNECTION_STRING,
});


async function genTables(){
const sql = `
CREATE TABLE IF NOT EXISTS users(
id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
first_name VARCHAR(255) NOT NULL,
last_name VARCHAR(255) NOT NULL,
email VARCHAR(320) UNIQUE NOT NULL,
password_hash VARCHAR(255) NOT NULL,
salt VARCHAR(255) NOT NULL,
member BOOLEAN DEFAULT false
);

CREATE TABLE IF NOT EXISTS messages(
id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
user_id INTEGER NOT NULL,
title VARCHAR(255) NOT NULL,
text TEXT NOT NULL,
sent_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
FOREIGN KEY (user_id) REFERENCES users(id)
);
`

await client.connect();
await client.query(sql);
await client.end();

console.log('Tables created')
}

genTables();

