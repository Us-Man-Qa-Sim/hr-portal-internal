const Sequelize = require("sequelize");
const { v4: UUIDV4 } = require("uuid");
const db = require("../configs/Database");

const Attendance = db.define(
  "attendance",
  {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    day: {
      type: Sequelize.DATE,
      defaultValue: () => {
        return new Date();
      },
    },
    userId: {
      type: Sequelize.UUID,
      allowNull: false,
    },
    punchedBy: { type: Sequelize.STRING, defaultValue: "User" },
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
      beforeCreate: (answer) => (answer.id = UUIDV4()),
    },
  }
);

module.exports = Attendance;
