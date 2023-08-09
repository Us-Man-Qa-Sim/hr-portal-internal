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
    let contentId = "9b172578-1d85-4257-851b-8e6c47b73795";

    //software Engineer

    await queryInterface.bulkInsert("permissions", [
      //user
      {
        id: permissionIds[85],
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
        id: permissionIds[86],
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
        id: permissionIds[87],
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
        id: permissionIds[88],
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
        id: permissionIds[89],
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
        id: permissionIds[90],
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
