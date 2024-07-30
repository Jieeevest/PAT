"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      "ref_tim_audit_ma",
      {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER,
        },
        pn_ma: {
          type: Sequelize.STRING,
        },
        nama_ma: {
          type: Sequelize.STRING,
        },
        jabatan: {
          type: Sequelize.STRING,
        },
        tim_audit_id: {
          type: Sequelize.BIGINT,
          foreignKey: true,
        },
        create_by: {
          type: Sequelize.JSON,
        },
        update_by: {
          type: Sequelize.JSON,
        },
        createdAt: {
          allowNull: false,
          type: Sequelize.DATE,
        },
        updatedAt: {
          allowNull: false,
          type: Sequelize.DATE,
        },
      },
      { schema: "pat" }
    );
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("ref_tim_audit_ma");
  },
};
