const Sequelize = require("sequelize");
const { v4: UUIDV4 } = require("uuid");
const db = require("../configs/Database");

const ClientTask = db.define(
  "clientTask",
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
    description: {
      type: Sequelize.TEXT,
      allowNull: false,
    },
    projectId: {
      type: Sequelize.UUID,
      allowNull: false,
    },
    statusId: { type: Sequelize.UUID, allowNull: false },
    priority: { type: Sequelize.STRING, allowNull: false },
    deleted: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
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
      beforeCreate: (clientTask) => (clientTask.id = UUIDV4()),
    },
  }
);

module.exports = ClientTask;
