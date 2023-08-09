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
        id: permissionIds[26],
        moduleId: moduleIds[5],
        read: true,
        update: false,
        write: false,
        delete: false,
        self: false,
        roleId: roleIds[0],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: permissionIds[27],
        moduleId: moduleIds[5],
        read: true,
        update: false,
        write: true,
        delete: false,
        self: false,
        roleId: roleIds[1],
        designationId: designationIds.ceo,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: permissionIds[28],
        moduleId: moduleIds[5],
        read: true,
        update: false,
        write: true,
        delete: false,
        self: false,
        roleId: roleIds[1],
        designationId: designationIds.embeddedEngineer,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: permissionIds[29],
        moduleId: moduleIds[5],
        read: true,
        update: false,
        write: true,
        delete: false,
        self: false,
        roleId: roleIds[1],
        designationId: designationIds.softwareEngineer,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: permissionIds[30],
        moduleId: moduleIds[5],
        read: true,
        update: false,
        write: true,
        delete: false,
        self: false,
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
