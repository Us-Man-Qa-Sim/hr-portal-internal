module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.addColumn(
            'users',
            'rfidNumber',
            Sequelize.TEXT
        );

    },

    down: (queryInterface, Sequelize) => {
        return queryInterface.removeColumn(
            'users',
            'rfidNumber'
        );
    }
}