const { v4: UUIDV4 } = require("uuid");
const Sequelize = require("sequelize");

const db = require("../configs/Database");

const Status = db.define(
  "status",
  {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    title: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    color: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    deleted: { type: Sequelize.BOOLEAN, defaultValue: false },
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
      beforeCreate: (status) => (status.id = UUIDV4()),
    },
  }
);

module.exports = Status;
