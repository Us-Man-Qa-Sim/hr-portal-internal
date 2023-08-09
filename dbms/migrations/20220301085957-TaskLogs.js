"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    return await queryInterface.createTable("taskLogs", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      taskId: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      userId: {
        type: Sequelize.UUID,
      },
      projectId: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      sprintId: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      statusId: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      shifted: { type: Sequelize.BOOLEAN, defaultValue: false },
      shiftedSprint: { type: Sequelize.UUID },
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

    return await queryInterface.dropTable("taskLogs");
  },
};
