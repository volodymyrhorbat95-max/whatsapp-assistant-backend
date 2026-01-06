'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('conversations', 'current_state', {
      type: Sequelize.STRING(50),
      allowNull: true,
      defaultValue: 'greeting'
    });

    await queryInterface.addColumn('conversations', 'collected_data', {
      type: Sequelize.JSONB,
      allowNull: true,
      defaultValue: {}
    });

    await queryInterface.addColumn('conversations', 'flow_type', {
      type: Sequelize.STRING(20),
      allowNull: true,
      defaultValue: null
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('conversations', 'current_state');
    await queryInterface.removeColumn('conversations', 'collected_data');
    await queryInterface.removeColumn('conversations', 'flow_type');
  }
};
