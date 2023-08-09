const Sequelize = require("sequelize");
const { v4: UUIDV4 } = require("uuid");
const db = require("../configs/Database");

const Task = db.define(
  "task",
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
    employeeId: {
      type: Sequelize.UUID,
    },
    createdby: { type: Sequelize.UUID, allowNull: false },
    statusId: { type: Sequelize.UUID, allowNull: false },
    priority: { type: Sequelize.STRING, allowNull: false },
    isComplete: { type: Sequelize.BOOLEAN, defaultValue: false },
    parentId: {
      type: Sequelize.UUID,
      defaultValue: null,
    },
    // dueDate: {
    //   type: Sequelize.DATE,
    //   allowNull: false,
    // },
    sprintId: {
      type: Sequelize.UUID,
    },
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
      beforeCreate: (task) => (task.id = UUIDV4()),
    },
  }
);

module.exports = Task;
