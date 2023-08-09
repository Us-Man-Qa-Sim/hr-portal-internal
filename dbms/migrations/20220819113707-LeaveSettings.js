"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     */
    await queryInterface.createTable("leaveSettings", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      annual: {
        type: Sequelize.BIGINT,
        allowNull: false,
      },
      casual: {
        type: Sequelize.BIGINT,
        allowNull: false,
      },
      medical: {
        type: Sequelize.BIGINT,
        allowNull: false,
      },
      leaveEncashment: {
        type: Sequelize.BOOLEAN,
      },
      carryForword: { type: Sequelize.BOOLEAN },
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

    await queryInterface.dropTable("leaveSettings");
  },
};
