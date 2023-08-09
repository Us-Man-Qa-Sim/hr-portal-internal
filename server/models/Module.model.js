const Sequelize = require("sequelize");
const { v4: UUIDV4 } = require("uuid");

const db = require("../configs/Database");

const Module = db.define(
  "module",
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
      beforeCreate: (module) => {
        module.id = UUIDV4();
      },
    },
  }
);

module.exports = Module;
