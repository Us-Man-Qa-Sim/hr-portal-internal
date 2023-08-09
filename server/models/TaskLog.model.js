const Sequelize = require("sequelize");
const { v4: UUIDV4 } = require("uuid");
const db = require("../configs/Database");

const TaskLog = db.define(
  "taskLog",
  {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    taskId: {
      type: Sequelize.UUID,
      allowNull: false,
    },
    userId: {
      type: Sequelize.UUID,
    },
    projectId: {
      type: Sequelize.UUID,
      allowNull: false,
    },
    sprintId: {
      type: Sequelize.UUID,
      allowNull: false,
    },
    statusId: {
      type: Sequelize.UUID,
      allowNull: false,
    },
    shifted: { type: Sequelize.BOOLEAN, defaultValue: false },
    shiftedSprint: { type: Sequelize.UUID },
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
      beforeCreate: (taskLog) => (taskLog.id = UUIDV4()),
    },
  }
);

module.exports = TaskLog;
