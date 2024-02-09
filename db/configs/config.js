require('dotenv').config();

module.exports = {
  production: {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    password: process.env.DB_PASSWORD,
    username: process.env.DB_USERNAME,
    database: process.env.DB_DATABASE,
    dialect: process.env.DB_DIALECT,
  },
  development: {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    password: process.env.DB_PASSWORD,
    username: process.env.DB_USERNAME,
    database: process.env.DB_DATABASE,
    dialect: process.env.DB_DIALECT,
  },
  test: {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    password: process.env.DB_PASSWORD,
    username: process.env.DB_USERNAME,
    database: process.env.DB_DATABASE,
    dialect: process.env.DB_DIALECT,
  }
}