const Sequelize = require("sequelize");
const { v4: UUIDV4 } = require("uuid");
const db = require("../configs/Database");

const ProjectDocument = db.define(
  "projectDocument",
  {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    documentURL: { type: Sequelize.TEXT, allowNull: false },
    projectId: {
      type: Sequelize.UUID,
      allowNull: true,
    },
    isImage: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    },
    userId: {
      type: Sequelize.UUID,
    },
    name: { type: Sequelize.STRING, defaultValue: null },
    type: { type: Sequelize.STRING, defaultValue: null },
    size: { type: Sequelize.STRING, defaultValue: null },
    date: {
      type: Sequelize.DATE,
      defaultValue: () => {
        return new Date();
      },
    },
    deleted: {
      type: Sequelize.BOOLEAN,
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
      beforeCreate: (projectDocument) => (projectDocument.id = UUIDV4()),
    },
  }
);

module.exports = ProjectDocument;
