"use strict";
const {
    designationIds,
    roleIds,
    departmentIds,
} = require("../../server/configs/Constants");
const itInternee = "852cdf35-5dd3-5a3f-8134-d8a773b3eb70"
const embeddedInternee = "852cdf35-5dd3-5a4f-8134-d8a773b3eb70"
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
                id: itInternee,
                title: "IT Internee",
                // departmentId: departmentIds[0],
                roleId: roleIds[1],
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                id: embeddedInternee,
                title: "Embedded Internee",
                // departmentId:departmentIds[1],
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
