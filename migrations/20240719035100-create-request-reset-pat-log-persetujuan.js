'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('request_reset_pat_log_persetujuan', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      reset_pat_id: {
        type: Sequelize.BIGINT
      },
      from: {
        type: Sequelize.JSON
      },
      to: {
        type: Sequelize.JSON
      },
      is_signed: {
        type: Sequelize.BOOLEAN
      },
      note: {
        type: Sequelize.TEXT
      },
      create_by: {
        type: Sequelize.JSON
      },
      update_by: {
        type: Sequelize.JSON
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    }, { schema: "pat"});
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('request_reset_pat_log_persetujuan');
  }
};