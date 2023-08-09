const Sequelize = require("sequelize");
const { v4: UUIDV4 } = require("uuid");
const db = require("../configs/Database");

const PayOut = db.define(
  "payOut",
  {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    employeeName: { type: Sequelize.STRING(200), allowNull: false },
    accountNumber: { type: Sequelize.STRING(16), allowNull: false },
    amount: { type: Sequelize.BIGINT, allowNull: false },
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
      beforeCreate: (payout) => (payout.id = UUIDV4()),
    },
  }
);

module.exports = PayOut;
