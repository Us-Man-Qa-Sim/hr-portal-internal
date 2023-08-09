"use strict";
const {
  permissionIds,
  roleIds,
  moduleIds,
  designationIds,
} = require("../../server/configs/Constants");

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("permissions", [
      {
        id: permissionIds[91],
        moduleId: moduleIds[6],
        read: true,
        update: true,
        write: true,
        delete: true,
        self: false,
        roleId: roleIds[0],
        designationId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: permissionIds[92],
        moduleId: moduleIds[6],
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
        id: permissionIds[93],
        moduleId: moduleIds[6],
        read: false,
        update: false,
        write: false,
        delete: false,
        self: true,
        roleId: roleIds[1],
        designationId: designationIds.embeddedEngineer,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: permissionIds[94],
        moduleId: moduleIds[6],
        read: false,
        update: false,
        write: false,
        delete: false,
        self: false,
        roleId: roleIds[1],
        designationId: designationIds.softwareEngineer,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: permissionIds[95],
        moduleId: moduleIds[6],
        read: true,
        update: true,
        write: true,
        delete: true,
        self: false,
        roleId: roleIds[1],
        designationId: designationIds.teamLead,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: permissionIds[96],
        moduleId: moduleIds[6],
        read: true,
        update: true,
        write: true,
        delete: true,
        self: false,
        roleId: roleIds[2],
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
