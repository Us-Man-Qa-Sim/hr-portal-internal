("use strict");

const {
  ClientBoardStatusIds,
  ClientBoardStatusTitle,
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
    await queryInterface.bulkInsert("clientBoardStatuses", [
      {
        id: ClientBoardStatusIds.ProjectScope,
        title: ClientBoardStatusTitle.ProjectScope,
        color: "red",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: ClientBoardStatusIds.Progress,
        title: ClientBoardStatusTitle.Progress,
        color: "blue",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: ClientBoardStatusIds.Complete,
        title: ClientBoardStatusTitle.Complete,
        color: "green",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: ClientBoardStatusIds.TeamQuestion,
        title: ClientBoardStatusTitle.TeamQuestion,
        color: "yellow",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: ClientBoardStatusIds.ClientQuestion,
        title: ClientBoardStatusTitle.ClientQuestion,
        color: "pink",
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
    await queryInterface.bulkDelete("clientBoardStatuses", null, {});
  },
};
