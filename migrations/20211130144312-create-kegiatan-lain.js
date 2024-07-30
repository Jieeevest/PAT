"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable(
      "kegiatan_lain",
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
        pic_maker_kegiatan_lain: {
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
    await queryInterface.dropTable("kegiatan_lain");
  },
};
