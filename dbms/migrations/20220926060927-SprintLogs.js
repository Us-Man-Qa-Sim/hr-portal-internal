"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     */
    await queryInterface.createTable("sprintLogs", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },

      taskId: { type: Sequelize.UUID, allowNull: false },
      projectId: { type: Sequelize.UUID, allowNull: false },
      employeeId: { type: Sequelize.UUID, allowNull: false },
      sprintId: { type: Sequelize.UUID, allowNull: false },
      isDelayed: { type: Sequelize.BOOLEAN, defaultValue: true },

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
    await queryInterface.dropTable("sprintLogs");
  },
};
