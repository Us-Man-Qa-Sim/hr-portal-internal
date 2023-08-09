const Sequelize = require("sequelize");
const { v4: UUIDV4 } = require("uuid");
const db = require("../configs/Database");

const Payment = db.define(
  "payments",
  {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    date: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: () => {
        return new Date();
      },
    },
    paymentType: { type: Sequelize.STRING, allowNull: false },
    paymentHeadId: { type: Sequelize.UUID },
    amount: { type: Sequelize.BIGINT, allowNull: false },
    debitType: { type: Sequelize.STRING },
    projectId: { type: Sequelize.UUID },
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
      beforeCreate: (payment) => (payment.id = UUIDV4()),
    },
  }
);

module.exports = Payment;
