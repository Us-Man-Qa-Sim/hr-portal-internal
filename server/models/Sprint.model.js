const Sequelize = require("sequelize");
const { v4: UUIDV4 } = require("uuid");
const db = require("../configs/Database");

const Sprint = db.define(
  "sprint",
  {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
    },
    sprint: {
      type: Sequelize.BIGINT,
      allowNull: false,
    },
    startDate: {
      type: Sequelize.DATEONLY,
      allowNull: false,
    },
    endDate: {
      type: Sequelize.DATEONLY,
      allowNull: false,
    },
    year: {
      type: Sequelize.BIGINT,
      allowNull: false,
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
      beforeCreate: (sprint) => (sprint.id = UUIDV4()),
    },
  }
);

module.exports = Sprint;
