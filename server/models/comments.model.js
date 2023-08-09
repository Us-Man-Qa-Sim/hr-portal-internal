const Sequelize = require("sequelize");
const { v4: UUIDV4 } = require("uuid");
const db = require("../configs/Database");

const Comment = db.define(
  "commnet",
  {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    text: {
      type: Sequelize.TEXT,
      allowNull: false,
    },
    date: {
      type: Sequelize.DATE,
      defaultValue: () => {
        return new Date();
      },
    },
    taskId: {
      type: Sequelize.UUID,
      allowNull: false,
    },
    userId: {
      type: Sequelize.UUID,
      allowNull: false,
    },
    issueId: {
      type: Sequelize.UUID,
      defaultValue: null,
    },
    parentId: {
      type: Sequelize.UUID,
      defaultValue: null,
    },
    isLog: { type: Sequelize.BOOLEAN, defaultValue: false },
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
      beforeCreate: (comment) => (comment.id = UUIDV4()),
    },
  }
);

module.exports = Comment;
