"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable(
      "auditee_jadwal_audit",
      {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.BIGINT,
        },
        jadwal_audit_id: {
          type: Sequelize.BIGINT,
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
          type: Sequelize.ARRAY(Sequelize.STRING),
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
          defaultValue: new Date(),
        },
        updatedAt: {
          allowNull: false,
          type: Sequelize.DATE,
          defaultValue: new Date(),
        },
      },
      { schema: "pat" }
    );
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("auditee_jadwal_audit");
  },
};
