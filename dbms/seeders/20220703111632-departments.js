"use strict";

const { departmentIds } = require("../../server/configs/Constants");

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

    await queryInterface.bulkInsert("departments", [
      {
        id: departmentIds[0],
        title: "IT",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: departmentIds[1],
        title: "Product Design",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: departmentIds[2],
        title: "Embedded Systems",
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

    await queryInterface.bulkDelete("departments", null, {});
  },
};
