require("dotenv").config();
const pg = require("pg");
const bcrypt = require("bcryptjs");
const client = new pg.Client({
  connectionString: process.env.CONNECTION_STRING,
});

async function hashSecrets() {
  const memberHash = await bcrypt.hash(process.env.MEMBER_PASS, 10);
  const adminHash = await bcrypt.hash(process.env.ADMIN_PASS, 12);

  const sql = `INSERT INTO passes VALUES('member pass', '${memberHash}', 10), ('admin pass', '${adminHash}', 12);`;

  await client.query(sql);
}

async function genTables() {
  const sql = `
CREATE TABLE IF NOT EXISTS users(
id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
first_name VARCHAR(255) NOT NULL,
last_name VARCHAR(255) NOT NULL,
email VARCHAR(320) UNIQUE NOT NULL,
password_hash VARCHAR(255) NOT NULL,
salt VARCHAR(255) NOT NULL,
member BOOLEAN DEFAULT false,
admin BOOLEAN DEFAULT false
);

CREATE TABLE IF NOT EXISTS messages(
id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
user_id INTEGER NOT NULL,
title VARCHAR(255) NOT NULL,
text TEXT NOT NULL,
sent_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS passes(
pass_name VARCHAR(255) PRIMARY KEY NOT NULL,
pass_hash VARCHAR(255) UNIQUE NOT NULL,
salt INTEGER NOT NULL
);
`;

  await client.connect();
  await client.query(sql);
  await hashSecrets();
  await client.end();

  console.log("Tables created");
}

genTables();
