const Sequelize = require("sequelize");
const { v4: UUIDV4 } = require("uuid");
const db = require("../configs/Database");

const Ticket = db.define(
  "ticket",
  {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    ticketNumber: { type: Sequelize.BIGINT, autoIncrement: true },
    ticketName: { type: Sequelize.STRING, allowNull: false },
    description: { type: Sequelize.TEXT, allowNull: false },
    projectId: { type: Sequelize.UUID, allowNull: false },
    date: { type: Sequelize.DATE, allowNull: false },
    employeeId: { type: Sequelize.UUID },
    priority: { type: Sequelize.STRING, allowNull: false },
    status: { type: Sequelize.STRING, defaultValue: "Pending", },
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
      beforeCreate: (ticket) => (ticket.id = UUIDV4()),
    },
  }
);

module.exports = Ticket;
