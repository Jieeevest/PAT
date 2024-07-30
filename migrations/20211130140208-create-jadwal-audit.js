"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable(
      "jadwal_audit",
      {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.BIGINT,
        },
        pat_id: {
          type: Sequelize.BIGINT,
        },
        tim_audit_id: {
          type: Sequelize.BIGINT,
          foreignKey: true,
        },
        tema_audit: {
          type: Sequelize.JSON,
        },
        ref_metode: {
          type: Sequelize.JSON,
        },
        ref_tipe: {
          type: Sequelize.JSON,
        },
        ref_jenis: {
          type: Sequelize.JSON,
        },
        ref_tema: {
          type: Sequelize.JSON,
        },
        name_kegiatan_audit: {
          type: Sequelize.STRING,
        },
        deskripsi: {
          type: Sequelize.TEXT,
        },
        count_target_jenis_auditee: {
          type: Sequelize.JSON,
        },
        pelaksanaan_start: {
          type: Sequelize.DATE,
        },
        pelaksanaan_end: {
          type: Sequelize.DATE,
        },
        pic_jadwal_audit: {
          type: Sequelize.JSON,
        },
        total_anggaran: {
          type: Sequelize.BIGINT,
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
    await queryInterface.dropTable("jadwal_audit");
  },
};
