const Sequelize = require("sequelize");
const { v4: UUIDV4 } = require("uuid");

const db = require("../configs/Database");

const Designation = db.define(
  "designation",
  {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
    },
    title: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    roleId: {
      type: Sequelize.UUID,
      allowNull: false,
    },
    canLead: {
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
      beforeCreate: (designation) => (designation.id = UUIDV4()),
    },
  }
);

module.exports = Designation;
