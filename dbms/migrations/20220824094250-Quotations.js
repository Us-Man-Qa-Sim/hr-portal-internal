"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     */
    await queryInterface.createTable("quotations", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      clientId: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      projectId: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      tax: {
        type: Sequelize.STRING,
      },
      discount: { type: Sequelize.STRING },
      quotationDate: { type: Sequelize.DATE, allowNull: false },
      expiryDate: { type: Sequelize.DATE, allowNull: false },
      total: { type: Sequelize.STRING, allowNull: false },
      status: { type: Sequelize.STRING, defaultValue: "Sent" },
      otherInformation: { type: Sequelize.TEXT },
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

    await queryInterface.dropTable("quotations");
  },
};
