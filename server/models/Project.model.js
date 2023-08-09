const Sequelize = require("sequelize");
const { v4: UUIDV4 } = require("uuid");
const { projectStatusIds } = require("../configs/Constants");
const db = require("../configs/Database");

const Project = db.define(
  "project",
  {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    title: { type: Sequelize.STRING, allowNull: false },
    description: { type: Sequelize.TEXT, allowNull: false },
    cost: { type: Sequelize.STRING },
    costType: { type: Sequelize.STRING },
    hours: { type: Sequelize.BIGINT },
    progress: { type: Sequelize.BIGINT, defaultValue: 0 },
    startDate: { type: Sequelize.DATE, allowNull: false },
    deadline: { type: Sequelize.DATE, allowNull: false },
    priority: { type: Sequelize.STRING, allowNull: false },
    createdBy: { type: Sequelize.UUID, allowNull: false },
    status: { type: Sequelize.UUID },
    clientId: { type: Sequelize.UUID, allowNull: false },
    departmentId: {
      type: Sequelize.UUID,
      allowNull: false,
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
      beforeCreate: (project) => (project.id = UUIDV4()),
    },
  }
);

module.exports = Project;
