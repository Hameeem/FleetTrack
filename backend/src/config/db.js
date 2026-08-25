const knex = require('knex');
const path = require('path');
require('dotenv').config();

const dbClient = process.env.DB_CLIENT || 'sqlite3';

let config;

if (dbClient === 'mysql') {
  config = {
    client: 'mysql2',
    connection: {
      host: process.env.DB_HOST || '127.0.0.1',
      port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'fleettrack_db'
    },
    pool: { min: 2, max: 10 }
  };
} else {
  const dbPath = path.resolve(__dirname, '../../../database/fleettrack.sqlite');
  config = {
    client: 'sqlite3',
    connection: {
      filename: dbPath
    },
    useNullAsDefault: true
  };
}

const db = knex(config);

module.exports = db;
