const Sequelize = require("sequelize");
const { v4: UUIDV4 } = require("uuid");
const db = require("../configs/Database");

const ProjectEmployee = db.define(
  "projectEmployee",
  {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      allowNull: false,
    },
    projectId: {
      type: Sequelize.UUID,
      allowNull: false,
      primaryKey: true,
    },
    employeeId: {
      type: Sequelize.UUID,
      allowNull: false,
      primaryKey: true,
    },
    isLead: {
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
      beforeCreate: (projectEmployee) => (projectEmployee.id = UUIDV4()),
    },
  }
);

module.exports = ProjectEmployee;
