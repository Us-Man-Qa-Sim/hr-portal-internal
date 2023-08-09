"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    return await queryInterface.createTable("conversations", {
      id: {
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        type: Sequelize.UUID,
      },
      title: {
        type: Sequelize.STRING,
      },
      converSequelizesationType: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      conversationMember1: {
        type: Sequelize.UUID,
      },
      conversationMember2: {
        type: Sequelize.UUID,
      },
      lastMessageTime: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: () => {
          return new Date();
        },
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
    return await queryInterface.dropTable("conversations");
  },
};
