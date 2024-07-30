"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable(
      "jadwal_sbp",
      {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.BIGINT,
        },
        nama: {
          type: Sequelize.STRING,
        },
        pat_id: {
          type: Sequelize.BIGINT,
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
        count_target_jenis_auditee: {
          type: Sequelize.JSON,
        },
        deskripsi: {
          type: Sequelize.TEXT,
        },
        pelaksanaan_start: {
          type: Sequelize.DATE,
        },
        pelaksanaan_end: {
          type: Sequelize.DATE,
        },
        pic_maker_jadwal_sbp: {
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
    await queryInterface.dropTable("jadwal_sbp");
  },
};
