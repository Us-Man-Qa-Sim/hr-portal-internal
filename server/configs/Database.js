const { Sequelize } = require("sequelize");

module.exports = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USERNAME,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: "postgres",
    logging: false,
    // force: true,
    ssl: process.env.DB_ENABLE_SSL === "true",
    dialectOptions: {
      ssl: process.env.DB_ENABLE_SSL === "true" && {
        require: true,
        rejectUnauthorized: false,
      },
    },
  }
);
