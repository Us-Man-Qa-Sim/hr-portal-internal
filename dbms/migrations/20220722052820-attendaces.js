"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     */
    await queryInterface.createTable("attendances", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      day: {
        type: Sequelize.DATE,
        defaultValue: () => {
          return new Date();
        },
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      punchedBy: { type: Sequelize.STRING, defaultValue: "User" },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     */

    await queryInterface.dropTable("attendances");
  },
};
