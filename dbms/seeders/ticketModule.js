"use strict";
const { moduleIds } = require("../../server/configs/Constants");

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.bulkInsert("modules", [
            {
                id: moduleIds[7],
                title: "TicketMangament",
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        ]);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete("modules", null, {});
    },
};
