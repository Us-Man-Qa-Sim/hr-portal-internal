const { STRING } = require("sequelize");
const Sequelize = require("sequelize");
const { v4: UUIDV4 } = require("uuid");
const db = require("../configs/Database");

const QuotationItem = db.define(
  "quotationItem",
  {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    quotationId: {
      type: Sequelize.UUID,
      allowNull: false,
    },
    itemName: { type: Sequelize.STRING, allowNull: false },
    description: { type: Sequelize.TEXT, allowNull: false },
    unitCost: { type: Sequelize.STRING, allowNull: false },
    quantity: { type: Sequelize.STRING, allowNull: false },
    amount: { type: Sequelize.STRING, allowNull: false },
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
      beforeCreate: (quotationItem) => (quotationItem.id = UUIDV4()),
    },
  }
);

module.exports = QuotationItem;
