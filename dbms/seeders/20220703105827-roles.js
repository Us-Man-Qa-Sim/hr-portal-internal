"use strict";
const { roleIds } = require("../../server/configs/Constants");

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
    await queryInterface.bulkInsert("roles", [
      {
        id: roleIds[0],
        title: "Admin",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: roleIds[1],
        title: "Employee",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: roleIds[2],
        title: "Client",
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

    await queryInterface.bulkDelete("roles", null, {});
  },
};
