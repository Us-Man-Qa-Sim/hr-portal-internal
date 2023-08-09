"use strict";

const { StatusTitle, StatusIds } = require("../../server/configs/Constants");

StatusTitle;
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
    await queryInterface.bulkInsert("statuses", [
      {
        id: StatusIds.Pending,
        title: StatusTitle.pending,
        color: "purple",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: StatusIds.Progress,
        title: StatusTitle.progress,
        color: "blue",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: StatusIds.Cancel,
        title: StatusTitle.Cancel,
        color: "red",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: StatusIds.Complete,
        title: StatusTitle.Complete,
        color: "green",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: StatusIds.Testing,
        title: StatusTitle.Test,
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
    await queryInterface.bulkDelete("statuses", null, {});
  },
};
