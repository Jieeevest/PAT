"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      "auditee_jadwal_sbp",
      {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER,
        },
        jadwal_sbp_id: {
          type: Sequelize.BIGINT,
          foreignKey: true,
        },
        ref_auditee_branch_kode: {
          type: Sequelize.INTEGER,
        },
        ref_auditee_branch_name: {
          type: Sequelize.STRING,
        },
        ref_auditee_orgeh_kode: {
          type: Sequelize.STRING,
        },
        ref_auditee_orgeh_name: {
          type: Sequelize.STRING,
        },
        tipe_uker: {
          type: Sequelize.STRING,
        },
        metode_pemantauan: {
          type: Sequelize.JSON,
        },
        deskripsi: {
          type: Sequelize.TEXT,
        },
        attachments: {
          type: Sequelize.STRING,
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
    await queryInterface.dropTable("auditee_jadwal_sbp");
  },
};
