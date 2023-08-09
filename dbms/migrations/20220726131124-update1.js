"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     */
    await [
      //   queryInterface.addColumn("users", "cnicNumber", {
      //     type: Sequelize.STRING(13),
      //     defaultValue: null,
      //   }),
      //   queryInterface.addColumn("users", "cnicExpiryDate", {
      //     type: Sequelize.DATE,
      //     defaultValue: null,
      //   }),
      //   queryInterface.addColumn("users", "martialStatus", {
      //     type: Sequelize.STRING,
      //     defaultValue: null,
      //   }),
    ];
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await [
      //   queryInterface.removeColumn("users", "cnicNumber"),
      //   queryInterface.removeColumn("users", "cnicExpiryDate"),
      //   queryInterface.removeColumn("users", "martialStatus"),
    ];
  },
};
