const Sequelize = require("sequelize");
const { v4: UUIDV4 } = require("uuid");
const db = require("../configs/Database");

const SprintLog = db.define(
  "sprintLog",
  {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
    },
    taskId: { type: Sequelize.UUID, allowNull: false },
    projectId: { type: Sequelize.UUID, allowNull: false },
    employeeId: { type: Sequelize.UUID, allowNull: false },
    sprintId: { type: Sequelize.UUID, allowNull: false },
    isDelayed: { type: Sequelize.BOOLEAN, defaultValue: true },

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
      beforeCreate: (sprintLog) => (sprintLog.id = UUIDV4()),
    },
  }
);

module.exports = SprintLog;
