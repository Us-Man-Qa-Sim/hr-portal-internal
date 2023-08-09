const Sequelize = require("sequelize");
const { v4: UUIDV4 } = require("uuid");
const db = require("../configs/Database");

const Expense = db.define(
  "expense",
  {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    itemName: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    purchaseFrom: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    purchaseDate: {
      type: Sequelize.DATE,
      allowNull: false,
    },
    purchasedBy: {
      type: Sequelize.UUID,
      allowNull: false,
    },
    amount: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    paidBy: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    status: {
      type: Sequelize.STRING,
      defaultValue: "Pending",
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
      beforeCreate: (expense) => (expense.id = UUIDV4()),
    },
  }
);

module.exports = Expense;
