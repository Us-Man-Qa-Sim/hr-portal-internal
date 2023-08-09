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
    let contentId = "d59b49a5-6c99-4f36-86f7-a53e60963199";

    //software Engineer

    await queryInterface.bulkInsert("permissions", [
      //user
      {
        id: permissionIds[49],
        moduleId: moduleIds[0],
        read: true,
        update: true,
        write: false,
        delete: false,
        self: true,
        roleId: roleIds[2],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      //project
      {
        id: permissionIds[50],
        moduleId: moduleIds[1],
        read: true,
        update: false,
        write: false,
        delete: false,
        self: false,
        roleId: roleIds[2],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      //task
      {
        id: permissionIds[51],
        moduleId: moduleIds[2],
        read: true,
        update: true,
        write: true,
        delete: true,
        self: true,
        roleId: roleIds[2],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      //taskComm
      {
        id: permissionIds[52],
        moduleId: moduleIds[3],
        read: true,
        update: true,
        write: true,
        delete: true,
        self: true,
        roleId: roleIds[2],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      //userInfo
      {
        id: permissionIds[53],
        moduleId: moduleIds[4],
        read: true,
        update: true,
        write: true,
        delete: true,
        self: true,
        roleId: roleIds[2],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      //attendance
      {
        id: permissionIds[54],
        moduleId: moduleIds[5],
        read: false,
        update: false,
        write: false,
        delete: false,
        self: true,
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
