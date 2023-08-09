const Sequelize = require("sequelize");
const { v4: UUIDV4 } = require("uuid");
const db = require("../configs/Database");

const TestQuestion = db.define(
  "testQuestion",
  {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    testId: {
      type: Sequelize.UUID,
      primaryKey: true,
      allowNull: false,
    },
    questionId: {
      type: Sequelize.UUID,
      allowNull: false,
      primaryKey: true,
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
    hhoks: {
      beforeCreate: (testQuestion) => (testQuestion.id = UUIDV4()),
    },
  }
);

module.exports = TestQuestion;
