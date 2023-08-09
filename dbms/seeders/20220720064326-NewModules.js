"use strict";
const { moduleIds } = require("../../server/configs/Constants");

module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
     */

    await queryInterface.bulkInsert("modules", [
      {
        id: moduleIds[1],
        title: "ProjectMangament",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: moduleIds[2],
        title: "taskMangament",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: moduleIds[3],
        title: "taskCommunicationMangament",
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

    await queryInterface.bulkDelete("modules", null, {});
  },
};
