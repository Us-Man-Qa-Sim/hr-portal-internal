"use strict";

const {
  leaveStatusIds,
  leaveStatusColor,
} = require("../../server/configs/Constants");

module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
     */
    await queryInterface.bulkInsert("leaveStatuses", [
      {
        id: leaveStatusIds.Pending,
        title: "Pending",
        color: leaveStatusColor.Pending,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: leaveStatusIds.Declined,
        title: "Declined",
        color: leaveStatusColor.Declined,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: leaveStatusIds.Approved,
        title: "Approved",
        color: leaveStatusColor.Approved,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     */
    await queryInterface.bulkDelete("leaveStatuses", null, {});
  },
};
