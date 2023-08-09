const Sequelize = require("sequelize");
const { v4: UUIDV4 } = require("uuid");
const db = require("../configs/Database");

const Message = db.define(
  "message",
  {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    conversationId: {
      type: Sequelize.UUID,
      allowNull: false,
    },
    senderId: {
      type: Sequelize.UUID,
      allowNull: false,
    },
    message: {
      type: Sequelize.STRING,
    },
    fileUrl: {
      type: Sequelize.TEXT,
    },
    read: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
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
      beforeCreate: (message) => (message.id = UUIDV4()),
    },
  }
);

module.exports = Message;
