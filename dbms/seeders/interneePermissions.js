"use strict";
const {
    permissionIds,
    roleIds,
    moduleIds,
    designationIds,
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
        await queryInterface.bulkInsert("permissions", [

            {
                id: permissionIds[103],
                moduleId: moduleIds[0],
                read: true,
                update: true,
                write: false,
                delete: false,
                self: true,
                roleId: roleIds[1],
                designationId: itInternee,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                id: permissionIds[104],
                moduleId: moduleIds[0],
                read: true,
                update: true,
                write: false,
                delete: false,
                self: true,
                roleId: roleIds[1],
                designationId: embeddedInternee,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                id: permissionIds[105],
                moduleId: moduleIds[1],
                read: true,
                update: false,
                write: false,
                delete: false,
                self: false,
                roleId: roleIds[1],
                designationId: itInternee,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                id: permissionIds[106],
                moduleId: moduleIds[1],
                read: true,
                update: false,
                write: false,
                delete: false,
                self: false,
                roleId: roleIds[1],
                designationId: embeddedInternee,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                id: permissionIds[107],
                moduleId: moduleIds[2],
                read: true,
                update: true,
                write: false,
                delete: false,
                self: true,
                roleId: roleIds[1],
                designationId: itInternee,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                id: permissionIds[108],
                moduleId: moduleIds[2],
                read: true,
                update: true,
                write: false,
                delete: false,
                self: true,
                roleId: roleIds[1],
                designationId: embeddedInternee,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                id: permissionIds[109],
                moduleId: moduleIds[3],
                read: true,
                update: true,
                write: true,
                delete: true,
                self: true,
                roleId: roleIds[1],
                designationId: itInternee,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                id: permissionIds[110],
                moduleId: moduleIds[3],
                read: true,
                update: true,
                write: true,
                delete: true,
                self: true,
                roleId: roleIds[1],
                designationId: embeddedInternee,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                id: permissionIds[111],
                moduleId: moduleIds[4],
                read: true,
                update: true,
                write: true,
                delete: true,
                self: true,
                roleId: roleIds[1],
                designationId: itInternee,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                id: permissionIds[112],
                moduleId: moduleIds[4],
                read: true,
                update: true,
                write: true,
                delete: true,
                self: true,
                roleId: roleIds[1],
                designationId: embeddedInternee,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                id: permissionIds[113],
                moduleId: moduleIds[5],
                read: true,
                update: false,
                write: true,
                delete: false,
                self: false,
                roleId: roleIds[1],
                designationId: itInternee,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                id: permissionIds[114],
                moduleId: moduleIds[5],
                read: true,
                update: false,
                write: true,
                delete: false,
                self: false,
                roleId: roleIds[1],
                designationId: embeddedInternee,
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
