const { v4: UUIDV4 } = require("uuid");
const Sequelize = require("sequelize");

const db = require("../configs/Database");

const leaveSetting = db.define(
  "leaveSetting",
  {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    annual: {
      type: Sequelize.BIGINT,
      allowNull: false,
    },
    casual: {
      type: Sequelize.BIGINT,
      allowNull: false,
    },
    medical: {
      type: Sequelize.BIGINT,
      allowNull: false,
    },
    leaveEncashment: {
      type: Sequelize.BOOLEAN,
    },
    carryForword: { type: Sequelize.BOOLEAN },
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
      beforeCreate: (leaveSetting) => (leaveSetting.id = UUIDV4()),
    },
  }
);

module.exports = leaveSetting;
