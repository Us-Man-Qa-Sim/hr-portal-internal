const Sequelize = require("sequelize");
const { v4: UUIDV4 } = require("uuid");
const db = require("../configs/Database");

const Bug = db.define(
  "bug",
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
    taskId: {
      type: Sequelize.UUID,
      allowNull: false,
    },
    employeeId: {
      type: Sequelize.UUID,
    },
    createdby: { type: Sequelize.UUID, allowNull: false },
    status: { type: Sequelize.STRING, defaultValue: "Open" },
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
      beforeCreate: (bug) => (bug.id = UUIDV4()),
    },
  }
);

module.exports = Bug;
