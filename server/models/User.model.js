const Sequelize = require("sequelize");
const bcrypt = require("bcrypt");
const { v4: UUIDV4 } = require("uuid");
const db = require("../configs/Database");

const User = db.define(
  "user",
  {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
      allowNull: false,
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
    rfidNumber: { type: Sequelize.TEXT },
    createdAt: {
      type: Sequelize.DATE,
      allowNull: false,
    },
    updatedAt: {
      type: Sequelize.DATE,
      allowNull: false,
    },
  },
  {
    hooks: {
      beforeCreate: (user) => {
        user.id = UUIDV4();
        const salt = bcrypt.genSaltSync(10);
        user.password = bcrypt.hashSync(user.password, salt);
      },
      beforeUpdate: (user) => {
        if (user.changed("password")) {
          const salt = bcrypt.genSaltSync(10);
          user.password = bcrypt.hashSync(user.password, salt);
        }
      },
    },
  }
);

User.prototype.validatePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = User;
