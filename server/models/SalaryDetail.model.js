const Sequelize = require("sequelize");
const { v4: UUIDV4 } = require("uuid");
const db = require("../configs/Database");

const SalaryDetail = db.define(
  "salaryDetail",
  {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    userId: {
      type: Sequelize.UUID,
      allowNull: false,
    },
    incentiveId: {
      type: Sequelize.UUID,
      allowNull: false,
    },
    date: {
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
      beforeCreate: (salarydetails) => (salarydetails.id = UUIDV4()),
    },
  }
);

module.exports = SalaryDetail;
