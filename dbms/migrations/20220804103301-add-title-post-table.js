module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.changeColumn("users", "password", {
        type: Sequelize.TEXT,
        allowNull: false,
      }),
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.changeColumn("users", "password", {
        type: Sequelize.TEXT,
        allowNull: false,
      }),
    ]);
  },
};
