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
    let contentId = "ee3c2ff4-653f-4954-a18d-6d83f20b8c4c";

    await queryInterface.bulkInsert("permissions", [
      //user
      {
        id: permissionIds[67],
        moduleId: moduleIds[0],
        read: true,
        update: true,
        write: true,
        delete: true,
        self: false,
        roleId: roleIds[1],
        designationId: contentId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      //project
      {
        id: permissionIds[68],
        moduleId: moduleIds[1],
        read: true,
        update: true,
        write: true,
        delete: true,
        self: false,
        roleId: roleIds[1],
        designationId: contentId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      //task
      {
        id: permissionIds[69],
        moduleId: moduleIds[2],
        read: true,
        update: true,
        write: true,
        delete: true,
        self: false,
        roleId: roleIds[1],
        designationId: contentId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      //taskComm
      {
        id: permissionIds[70],
        moduleId: moduleIds[3],
        read: true,
        update: true,
        write: true,
        delete: true,
        self: false,
        roleId: roleIds[1],
        designationId: contentId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      //userInfo
      {
        id: permissionIds[71],
        moduleId: moduleIds[4],
        read: true,
        update: true,
        write: true,
        delete: true,
        self: false,
        roleId: roleIds[1],
        designationId: contentId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      //attendance
      {
        id: permissionIds[72],
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
