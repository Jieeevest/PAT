require('dotenv').config();
const Sequelize = require('sequelize');
const fastify = require("fastify")({
  logger: true
});

const sequelize = new Sequelize(
process.env.DB_DATABASE, 
process.env.DB_USER, 
process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  dialect: 'postgres',
  timezone: '+07:00',
  pool: {
    max: parseInt(process.env.DB_POOL_MAX || 300),
    acquire: 30000,
    idle: 10000
  }
});

sequelize.authenticate().then(() => {
  fastify.log.info("Database connection has been established successfully.");
}).catch(err => {
  fastify.log.error("Unable to connect to the database:", err);
  process.exit(-1);
});

module.exports = sequelize;