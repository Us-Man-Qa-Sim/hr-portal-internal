"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     */
    await queryInterface.createTable("tickets", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      ticketNumber: { type: Sequelize.BIGINT, autoIncrement: true },
      ticketName: { type: Sequelize.STRING, allowNull: false },
      description: { type: Sequelize.TEXT, allowNull: false },
      project: { type: Sequelize.UUID, allowNull: false },
      date: { type: Sequelize.DATE, allowNull: false },
      employeeId: { type: Sequelize.UUID },
      priority: { type: Sequelize.STRING, allowNull: false },
      status: { type: Sequelize.STRING, defaultValue: "Pending" },
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
    await queryInterface.dropTable("tickets");
  },
};
