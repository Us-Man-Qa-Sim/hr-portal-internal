"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */

    return await queryInterface.createTable("users", {
      id: {
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        type: Sequelize.UUID,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      deviceToken: { type: Sequelize.TEXT },
      gender: { type: Sequelize.STRING },
      birthday: { type: Sequelize.DATE },
      leaves: {
        type: Sequelize.BIGINT,
        allowNull: false,
        defaultValue: 0,
      },
      jobStatus: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      joiningDate: {
        type: Sequelize.DATE,
      },
      profilePhoto: {
        type: Sequelize.STRING,
      },
      cnicFrontPhoto: {
        type: Sequelize.STRING,
      },
      cnicBackPhoto: {
        type: Sequelize.STRING,
      },
      contactNumber: { type: Sequelize.STRING },
      bankName: { type: Sequelize.STRING },
      bacnkAccountTitle: { type: Sequelize.STRING },
      bankAccountIban: { type: Sequelize.STRING(24) },
      bankAccountNumber: { type: Sequelize.STRING(14) },
      basicSalary: { type: Sequelize.STRING },
      roleId: { type: Sequelize.UUID },
      designationId: { type: Sequelize.UUID },
      cnicNumber: {
        type: Sequelize.STRING(13),
        defaultValue: null,
      },
      cnicExpiryDate: { type: Sequelize.DATE, defaultValue: null },
      martialStatus: { type: Sequelize.STRING, defaultValue: null },
      address: { type: Sequelize.TEXT, defaultValue: null },
      deleted: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      isClient: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      company: {
        type: Sequelize.STRING,
        defaultValue: null,
      },
      clientRole: {
        type: Sequelize.STRING,
        defaultValue: null,
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

    return await queryInterface.dropTable("users");
  },
};
