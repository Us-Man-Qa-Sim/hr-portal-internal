const Sequelize = require("sequelize");
const { v4: UUIDV4 } = require("uuid");
const db = require("../configs/Database");

const TicketLog = db.define(
    "ticketLog",
    {
        id: {
            type: Sequelize.UUID,
            defaultValue: Sequelize.UUIDV4,
            primaryKey: true,
            allowNull: false,
        },
        log: { type: Sequelize.TEXT },
        userId: { type: Sequelize.UUID },
        ticketId: { type: Sequelize.UUID },
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
            beforeCreate: (ticketLog) => (ticketLog.id = UUIDV4()),
        },
    }
);

module.exports = TicketLog;
