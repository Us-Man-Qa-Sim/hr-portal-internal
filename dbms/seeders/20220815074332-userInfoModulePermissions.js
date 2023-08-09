"use strict";
const {
  permissionIds,
  roleIds,
  moduleIds,
  designationIds,
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
    await queryInterface.bulkInsert("permissions", [
      {
        id: permissionIds[21],
        moduleId: moduleIds[4],
        read: true,
        update: true,
        write: true,
        delete: true,
        self: false,
        roleId: roleIds[0],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: permissionIds[22],
        moduleId: moduleIds[4],
        read: true,
        update: true,
        write: true,
        delete: true,
        self: false,
        roleId: roleIds[1],
        designationId: designationIds.ceo,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: permissionIds[23],
        moduleId: moduleIds[4],
        read: true,
        update: true,
        write: true,
        delete: true,
        self: true,
        roleId: roleIds[1],
        designationId: designationIds.embeddedEngineer,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: permissionIds[24],
        moduleId: moduleIds[4],
        read: true,
        update: true,
        write: true,
        delete: true,
        self: true,
        roleId: roleIds[1],
        designationId: designationIds.softwareEngineer,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: permissionIds[25],
        moduleId: moduleIds[4],
        read: true,
        update: true,
        write: true,
        delete: true,
        self: true,
        roleId: roleIds[1],
        designationId: designationIds.teamLead,
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
    await queryInterface.bulkDelete("permissions", null, {});
  },
};
