const Sequelize = require("sequelize");
const db = require("../configs/Database");
const { v4: UUIDV4 } = require("uuid");
const Notifies = db.define(
  "notifies",
  {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    notificationId: {
      type: Sequelize.UUID,
      allowNull: false,
    },
    from: {
      type: Sequelize.UUID,
      allowNull: false,
    },
    to: {
      type: Sequelize.UUID,
      allowNull: false,
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
      beforeCreate: (notifies) => (notifies.id = UUIDV4()),
    },
  }
);

module.exports = Notifies;
