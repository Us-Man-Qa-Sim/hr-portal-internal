require("dotenv").config({ path: "./configs.env" });

module.exports = {
  development: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    dialect: "postgres",
    ssl: process.env.DB_ENABLE_SSL === "true",
    dialectOptions: {
      ssl: process.env.DB_ENABLE_SSL === "true" && {
        require: true,
        rejectUnauthorized: false,
      },
    },
  },
  test: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    dialect: "postgres",
    ssl: process.env.DB_ENABLE_SSL === "true",
    dialectOptions: {
      ssl: process.env.DB_ENABLE_SSL === "true" && {
        require: true,
        rejectUnauthorized: false,
      },
    },
  },
  production: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    dialect: "postgres",
    ssl: process.env.DB_ENABLE_SSL === "true",
    dialectOptions: {
      ssl: process.env.DB_ENABLE_SSL === "true" && {
        require: true,
        rejectUnauthorized: false,
      },
    },
  },
};
