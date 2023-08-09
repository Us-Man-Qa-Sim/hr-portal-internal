"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */

    return await queryInterface.createTable("task", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      projectId: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      employeeId: {
        type: Sequelize.UUID,
      },
      createdby: { type: Sequelize.UUID, allowNull: false },
      statusId: { type: Sequelize.UUID, allowNull: false },
      priority: { type: Sequelize.STRING, allowNull: false },
      isComplete: { type: Sequelize.BOOLEAN, defaultValue: false },
      parentId: {
        type: Sequelize.UUID,
        defaultValue: null,
      },
      // dueDate: {
      //   type: Sequelize.DATE,
      //   allowNull: false,
      // },
      sprintId: {
        type: Sequelize.UUID,
      },
      deleted: {
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
    return await queryInterface.dropTable("tasks");
  },
};
