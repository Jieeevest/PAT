'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('request_reset_pat', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      pat_id: {
        type: Sequelize.BIGINT
      },
      initiator: {
        type: Sequelize.JSON
      },
      status_persetujuan: {
        type: Sequelize.STRING
      },
      status_approver: {
        type: Sequelize.JSON
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
    }, { schema: "pat"} );
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('request_reset_pat');
  }
};