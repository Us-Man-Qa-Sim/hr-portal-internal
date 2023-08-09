"use-strict";

module.exports = {
  up(queryInterface, Sequelize) {
    return Promise.all([
      queryInterface.addColumn(
        "tasks", // table name
        "sprintId", // new field name
        {
          type: Sequelize.UUID,
        }
      ),
    ]);
  },

  down(queryInterface, Sequelize) {
    // logic for reverting the changes
    return Promise.all([queryInterface.removeColumn("tasks", "sprintId")]);
  },
};
