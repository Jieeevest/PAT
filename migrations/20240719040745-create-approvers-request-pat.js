'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('approvers_request_pat', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      pn: {
        type: Sequelize.STRING
      },
      nama: {
        type: Sequelize.STRING
      },
      reset_pat_id: {
        type: Sequelize.BIGINT
      },
      is_signed: {
        type: Sequelize.BOOLEAN
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
    }, { schema: 'pat'});
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('approvers_request_pat');
  }
};