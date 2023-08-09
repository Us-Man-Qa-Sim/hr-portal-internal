const Sequelize = require("sequelize");
const { v4: UUIDV4 } = require("uuid");
const db = require("../configs/Database");

const EducationInformation = db.define(
  "educationInformation",
  {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    institute: {
      type: Sequelize.TEXT,
      allowNull: false,
    },
    subject: {
      type: Sequelize.TEXT,
      allowNull: false,
    },
    userId: {
      type: Sequelize.UUID,
      allowNull: false,
    },
    startDate: {
      type: Sequelize.DATE,
      allowNull: false,
    },
    endDate: {
      type: Sequelize.DATE,
      allowNull: false,
    },
    degree: {
      type: Sequelize.TEXT,
      allowNull: false,
    },
    grade: {
      type: Sequelize.TEXT,
      defaultValue: null,
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
      beforeCreate: (educationInformation) =>
        (educationInformation.id = UUIDV4()),
    },
  }
);

module.exports = EducationInformation;
