const Sequelize = require("sequelize");
const { v4: UUIDV4 } = require("uuid");
const db = require("../configs/Database");

const BugLog = db.define(
  "bugLog",
  {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    text: {
      type: Sequelize.TEXT,
      allowNull: false,
    },
    bugId: {
      type: Sequelize.UUID,
      allowNull: false,
    },
    userId: {
      type: Sequelize.UUID,
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
      beforeCreate: (bugLog) => (bugLog.id = UUIDV4()),
    },
  }
);

module.exports = BugLog;
