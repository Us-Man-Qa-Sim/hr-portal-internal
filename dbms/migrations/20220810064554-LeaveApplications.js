"use strict";
const { leaveStatusIds } = require("../../server/configs/Constants");

module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    return await queryInterface.createTable("leaveApplications", {
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
        defaultValue: leaveStatusIds.PENDING,
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
    });
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    return await queryInterface.dropTable("leaveApplications");
  },
};
