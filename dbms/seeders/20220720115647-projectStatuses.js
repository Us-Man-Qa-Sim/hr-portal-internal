"use strict";

const {
  projectStatusTitle,
  projectStatusIds,
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
    await queryInterface.bulkInsert("projectStatuses", [
      {
        id: projectStatusIds.Pending,
        title: projectStatusTitle.pending,
        color: "yellow",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: projectStatusIds.Progress,
        title: projectStatusTitle.progress,
        color: "blue",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: projectStatusIds.Cancelled,
        title: projectStatusTitle.cancelled,
        color: "red",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: projectStatusIds.Complete,
        title: projectStatusTitle.complete,
        color: "green",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: projectStatusIds.Support,
        title: projectStatusTitle.support,
        color: "orange",
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
    await queryInterface.bulkDelete("projectStatuses", null, {});
  },
};
