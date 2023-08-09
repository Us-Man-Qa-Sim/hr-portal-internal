const Sequelize = require("sequelize");
const { v4: UUIDV4 } = require("uuid");
const db = require("../configs/Database");

const Conversation = db.define(
  "conversation",
  {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    title: {
      type: Sequelize.STRING,
    },
    conversationType: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    conversationMember1: {
      type: Sequelize.UUID,
    },
    conversationMember2: {
      type: Sequelize.UUID,
    },
    lastMessageTime: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: () => {
        return new Date();
      },
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
      beforeCreate: (conversation) => (conversation.id = UUIDV4()),
    },
  }
);

module.exports = Conversation;
