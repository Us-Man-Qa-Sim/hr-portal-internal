"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */

    return await queryInterface.createTable("projectEmployees", {
      id: {
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        type: Sequelize.UUID,
      },
      projectId: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true,
      },
      employeeId: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true,
      },
      isLead: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
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
     * await queryInterface.dropTable('users');
     */
    return await queryInterface.dropTable("projectEmployees");
  },
};
