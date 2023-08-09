const Sequelize = require("sequelize");
const { leaveStatusIds } = require("../configs/Constants");
const { v4: UUIDV4 } = require("uuid");
const db = require("../configs/Database");

const LeaveApplication = db.define(
  "leaveApplication",
  {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    employeeId: {
      type: Sequelize.UUID,
      allowNull: false,
    },
    leaveType: { type: Sequelize.STRING, allowNull: false },
    leavestatus: {
      type: Sequelize.UUID,
      defaultValue: leaveStatusIds.Pending,
    },
    from: {
      type: Sequelize.DATE,
      allowNull: false,
    },
    to: {
      type: Sequelize.DATE,
      allowNull: false,
    },
    noOfDays: {
      type: Sequelize.BIGINT,
      allowNull: false,
    },
    reason: { type: Sequelize.TEXT, allowNull: false },
    approvedBy: { type: Sequelize.UUID },
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
      beforeCreate: (leaveApplication) => (leaveApplication.id = UUIDV4()),
    },
  }
);

module.exports = LeaveApplication;
