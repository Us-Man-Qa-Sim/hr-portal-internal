const { v4: UUIDV4 } = require("uuid");
const Sequelize = require("sequelize");

const db = require("../configs/Database");

const Incentive = db.define(
  "incentive",
  {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    incentive: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    amount: {
      type: Sequelize.BIGINT,
    },
    percentage: {
      type: Sequelize.BIGINT,
    },
    isMonthly: { type: Sequelize.BOOLEAN, defaultValue: false },
    type: { type: Sequelize.STRING, allowNull: false },
    isPercentage: { type: Sequelize.BOOLEAN, defaultValue: false },
    date: { type: Sequelize.DATE },
    deleted: { type: Sequelize.BOOLEAN, defaultValue: false },
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
      beforeCreate: (incentive) => (incentive.id = UUIDV4()),
    },
  }
);

module.exports = Incentive;
