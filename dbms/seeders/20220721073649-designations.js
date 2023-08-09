"use strict";
const {
  designationIds,
  roleIds,
  departmentIds,
} = require("../../server/configs/Constants");

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

    await queryInterface.bulkInsert("designations", [
      {
        id: designationIds.softwareEngineer,
        title: "Software Engineer",
        // departmentId: departmentIds[0],
        roleId: roleIds[1],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: designationIds.embeddedEngineer,
        title: "Embedded Engineer",
        // departmentId:departmentIds[1],
        roleId: roleIds[1],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: designationIds.teamLead,
        title: "Team Lead",
        roleId: roleIds[1],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: designationIds.ceo,
        title: "CEO",
        roleId: roleIds[1],
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

    await queryInterface.bulkDelete("designations", null, {});
  },
};
