"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     */
    await queryInterface.createTable("projectDocuments", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      documentURL: { type: Sequelize.TEXT, allowNull: false },
      projectId: {
        type: Sequelize.UUID,
        allowNull: true,
      },
      isImage: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      userId: {
        type: Sequelize.UUID,
      },
      name: { type: Sequelize.STRING, defaultValue: null },
      type: { type: Sequelize.STRING, defaultValue: null },
      size: { type: Sequelize.STRING, defaultValue: null },
      date: {
        type: Sequelize.DATE,
        defaultValue: () => {
          return new Date();
        },
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
     */
    await queryInterface.dropTable("projectDocuments");
  },
};
