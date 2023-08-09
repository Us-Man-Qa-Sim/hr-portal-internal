const Sequelize = require("sequelize");
const { v4: UUIDV4 } = require("uuid");
const db = require("../configs/Database");

const EmployeeSalarySlip = db.define(
  "employeeSalarySlip",
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
    baseSalary: {
      type: Sequelize.BIGINT,
      allowNull: false,
    },
    netSalary: {
      type: Sequelize.BIGINT,
      allowNull: false,
    },
    month: {
      type: Sequelize.BIGINT,
      allowNull: false,
    },
    year: {
      type: Sequelize.BIGINT,
      allowNull: false,
    },
    lopDeduction: {
      type: Sequelize.BIGINT,
      defaultValue: 0,
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
      beforeCreate: (employeeSalary) => (employeeSalary.id = UUIDV4()),
    },
  }
);

module.exports = EmployeeSalarySlip;
