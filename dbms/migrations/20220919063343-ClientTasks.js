"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("clientTasks", {
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
      statusId: { type: Sequelize.UUID, allowNull: false },
      priority: { type: Sequelize.STRING, allowNull: false },
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
    await queryInterface.dropTable("clientTasks");
  },
};
