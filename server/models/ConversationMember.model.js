const Sequelize = require("sequelize");
const { v4: UUIDV4 } = require("uuid");
const db = require("../configs/Database");

const ConversationMember = db.define(
  "conversationMember",
  {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    conversationId: {
      type: Sequelize.UUID,
    },
    memberId: {
      type: Sequelize.UUID,
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
      beforeCreate: (conversationMember) => {
        conversationMember.id = UUIDV4();
      },
    },
  }
);

module.exports = ConversationMember;
