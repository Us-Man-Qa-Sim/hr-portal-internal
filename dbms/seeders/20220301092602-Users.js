"use strict";
const bcrypt = require("bcrypt");
const { userIds, roleIds } = require("../../server/configs/Constants");

module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
     */
    // let createdRoleIds = await queryInterface.bulkInsert(
    //   "roles",
    //   [
    //     {
    //       id: "8d8bc566-6a75-4f36-144e-6d4cfec8466b",
    //       title: "Admin",
    //       createdAt: new Date(),
    //       updatedAt: new Date(),
    //     },
    //     {
    //       id: "8d8bc566-6a75-4f36-145e-6d4cfec8466b",
    //       title: "Employee",
    //       createdAt: new Date(),
    //       updatedAt: new Date(),
    //     },
    //     {
    //       id: "8d8bc566-6a75-4f36-146e-6d4cfec8466b",
    //       title: "Client",
    //       createdAt: new Date(),
    //       updatedAt: new Date(),
    //     },
    //   ],
    //   {
    //     returning: ["id"],
    //   }
    // );

    // let createdModuleIds = await queryInterface.bulkInsert(
    //   "modules",
    //   [
    //     {
    //       id: "8d8bc566-6a75-4f36-200e-6d4cfec8466b",
    //       title: "UserMangament",
    //       createdAt: new Date(),
    //       updatedAt: new Date(),
    //     },
    //   ],
    //   {
    //     returning: ["id"],
    //   }
    // );

    // const { id } = createdRoleIds[0];

    // let createdPermissionIds = await queryInterface.bulkInsert(
    //   "permissions",
    //   [
    //     {
    //       id: "8d8bc566-6a75-4f36-100e-6d4cfec8466b",
    //       moduleId: createdModuleIds[0].id,
    //       read: true,
    //       update: true,
    //       write: true,
    //       delete: true,
    //       roleId: id,
    //       createdAt: new Date(),
    //       updatedAt: new Date(),
    //     },
    //   ],
    //   {
    //     returning: ["id"],
    //   }
    // );

    return await queryInterface.bulkInsert("users", [
      {
        id: userIds[0],
        name: "EMI Admin",
        email: "emi@emifusion.com",
        password: bcrypt.hashSync("123456", bcrypt.genSaltSync(10)),
        roleId: roleIds[0],
        leaves: 0,
        jobStatus: "Permanent",
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
     * await queryInterface.bulkDelete('People', null, {});
     */

    return await queryInterface.bulkDelete("users", null, {});
  },
};
