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
    let contentId = "fbcaff22-5419-4710-a774-5a7ff998572d";

    //software Engineer

    await queryInterface.bulkInsert("permissions", [
      //user
      {
        id: permissionIds[97],
        moduleId: moduleIds[0],
        read: true,
        update: true,
        write: false,
        delete: false,
        self: true,
        roleId: roleIds[1],
        designationId: contentId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      //project
      {
        id: permissionIds[98],
        moduleId: moduleIds[1],
        read: true,
        update: false,
        write: false,
        delete: false,
        self: false,
        roleId: roleIds[1],
        designationId: contentId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      //task
      {
        id: permissionIds[99],
        moduleId: moduleIds[2],
        read: true,
        update: true,
        write: false,
        delete: false,
        self: true,
        roleId: roleIds[1],
        designationId: contentId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      //taskComm
      {
        id: permissionIds[100],
        moduleId: moduleIds[3],
        read: true,
        update: true,
        write: true,
        delete: true,
        self: true,
        roleId: roleIds[1],
        designationId: contentId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      //userInfo
      {
        id: permissionIds[101],
        moduleId: moduleIds[4],
        read: true,
        update: true,
        write: true,
        delete: true,
        self: true,
        roleId: roleIds[1],
        designationId: contentId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      //attendance
      {
        id: permissionIds[102],
        moduleId: moduleIds[5],
        read: true,
        update: false,
        write: true,
        delete: false,
        self: false,
        roleId: roleIds[1],
        designationId: contentId,
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
