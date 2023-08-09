const { v4: UUIDV4 } = require("uuid");
const Sequelize = require("sequelize");

const db = require("../configs/Database");

const projectStatus = db.define(
  "projectStatus",
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
      beforeCreate: (projectStatus) => (projectStatus.id = UUIDV4()),
    },
  }
);

module.exports = projectStatus;
