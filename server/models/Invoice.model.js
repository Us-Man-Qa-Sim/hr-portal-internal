const Sequelize = require("sequelize");
const { v4: UUIDV4 } = require("uuid");
const db = require("../configs/Database");

const Invoice = db.define(
  "invoice",
  {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    clientId: {
      type: Sequelize.UUID,
      allowNull: false,
    },
    projectId: {
      type: Sequelize.UUID,
      allowNull: false,
    },
    tax: {
      type: Sequelize.STRING,
    },
    discount: { type: Sequelize.STRING },
    invoiceDate: { type: Sequelize.DATE, allowNull: false },
    expiryDate: { type: Sequelize.DATE, allowNull: false },
    total: { type: Sequelize.STRING, allowNull: false },
    status: { type: Sequelize.STRING, defaultValue: "Sent" },
    otherInformation: { type: Sequelize.TEXT },
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
      beforeCreate: (invoice) => (invoice.id = UUIDV4()),
    },
  }
);

module.exports = Invoice;
