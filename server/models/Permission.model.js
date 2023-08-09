const Sequelize = require("sequelize");
const { v4: UUIDV4 } = require("uuid");
const db = require("../configs/Database");

const Permission = db.define(
  "permission",
  {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
    },
    moduleId: {
      type: Sequelize.UUID,
      allowNull: false,
      primaryKey: true,
    },
    read: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    },
    write: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    },
    update: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    },
    delete: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    },
    self: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    },
    deleted: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    },
    roleId: { type: Sequelize.UUID, allowNull: false, primaryKey: true },
    designationId: { type: Sequelize.UUID },
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
      beforeCreate: (permission) => (permission.id = UUIDV4()),
    },
  }
);

module.exports = Permission;
