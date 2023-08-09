const Sequelize = require("sequelize");
const { v4: UUIDV4 } = require("uuid");
const db = require("../configs/Database");

const Experience = db.define(
  "experience",
  {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    company: {
      type: Sequelize.TEXT,
      allowNull: false,
    },
    jobPosition: {
      type: Sequelize.TEXT,
      allowNull: false,
    },
    location: {
      type: Sequelize.TEXT,
      allowNull: false,
    },
    userId: {
      type: Sequelize.UUID,
      allowNull: false,
    },
    startDate: {
      type: Sequelize.DATE,
      allowNull: false,
    },
    endDate: {
      type: Sequelize.DATE,
    },
    createdAt: {
      type: Sequelize.DATE,
      allowNull: false,
    },
    updatedAt: {
      type: Sequelize.DATE,
      allowNull: false,
    },
  },
  {
    hooks: {
      beforeCreate: (experience) => (experience.id = UUIDV4()),
    },
  }
);

module.exports = Experience;
