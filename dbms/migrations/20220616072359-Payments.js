"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */

    await queryInterface.createTable("payments", {
      id: {
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        type: Sequelize.UUID,
      },
      date: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: () => {
          return new Date();
        },
      },
      paymentType: { type: Sequelize.STRING, allowNull: false },
      paymentHeadId: { type: Sequelize.UUID },
      amount: { type: Sequelize.BIGINT, allowNull: false },
      debitType: { type: Sequelize.STRING },
      projectId: { type: Sequelize.UUID },
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
     * await queryInterface.dropTable('users');
     */

    await queryInterface.dropTable("payments");
  },
};
