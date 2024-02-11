'use strict';

const table_name = 'scheduled_messages';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable(table_name, {
      id: {
        type: Sequelize.INTEGER(10).UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
      },
      user_id: {
        type: Sequelize.INTEGER(10).UNSIGNED,
        allowNull: false,
      },
      recipient: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      recipient_type: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      recipient_type: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      scheduled_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },

      title: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      body: {
        type: Sequelize.TEXT,
        allowNull: false,
      },

      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      deleted_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable(table_name);
  }
};
