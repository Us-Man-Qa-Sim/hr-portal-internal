const Sequelize = require("sequelize");
const { v4: UUIDV4 } = require("uuid");
const db = require("../configs/Database");

const ExpenseAttachment = db.define(
  "expenseAttachments",
  {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    expenseId: {
      type: Sequelize.UUID,
      allowNull: false,
    },
    attachmentURL: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    attachmentName: {
      type: Sequelize.STRING,
      allowNull: false,
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
      beforeCreate: (expenseAttachment) => (expenseAttachment.id = UUIDV4()),
    },
  }
);

module.exports = ExpenseAttachment;
