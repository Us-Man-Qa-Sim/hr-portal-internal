const Sequelize = require("sequelize");
const { v4: UUIDV4 } = require("uuid");
const db = require("../configs/Database");

const ProjectEquipment = db.define(
  "projectEquipment",
  {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    name: { type: Sequelize.STRING, allowNull: false },
    price: { type: Sequelize.STRING, allowNull: false },
    quantity: { type: Sequelize.STRING, allowNull: false },
    projectId: { type: Sequelize.UUID, allowNull: false },
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
  },
  {
    hooks: {
      beforeCreate: (ProjectEquipment) => (ProjectEquipment.id = UUIDV4()),
    },
  }
);

module.exports = ProjectEquipment;
