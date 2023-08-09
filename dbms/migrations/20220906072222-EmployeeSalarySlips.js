"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     */
    await queryInterface.createTable("employeeSalarySlips", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      baseSalary: {
        type: Sequelize.BIGINT,
        allowNull: false,
      },
      netSalary: {
        type: Sequelize.BIGINT,
        allowNull: false,
      },
      month: {
        type: Sequelize.BIGINT,
        allowNull: false,
      },
      year: {
        type: Sequelize.BIGINT,
        allowNull: false,
      },
      lopDeduction: {
        type: Sequelize.BIGINT,
        defaultValue: 0,
      },
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
    await queryInterface.dropTable("employeeSalarySlips");
  },
};
