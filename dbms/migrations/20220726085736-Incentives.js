"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     */
    await queryInterface.createTable("incentives", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      incentive: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      amount: {
        type: Sequelize.BIGINT,
      },
      percentage: {
        type: Sequelize.BIGINT,
      },
      isMonthly: { type: Sequelize.BOOLEAN, defaultValue: false },
      type: { type: Sequelize.STRING, allowNull: false },
      isPercentage: { type: Sequelize.BOOLEAN, defaultValue: false },
      date: { type: Sequelize.DATE },
      deleted: { type: Sequelize.BOOLEAN, defaultValue: false },
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
    await queryInterface.dropTable("incentives");
  },
};
