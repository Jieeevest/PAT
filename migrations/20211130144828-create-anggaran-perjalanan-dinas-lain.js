"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("anggaran_perjalanan_dinas_lain", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT,
      },
      kegiatan_lain_id: {
        type: Sequelize.BIGINT,
      },
      pn_auditor: {
        type: Sequelize.JSON,
      },
      lama_kegiatan: {
        type: Sequelize.INTEGER,
      },
      biaya_perjalanan_hari: {
        type: Sequelize.BIGINT,
        defaultValue : 0
      },
      biaya_tiket_pp: {
        type: Sequelize.BIGINT,
        defaultValue : 0
      },
      biaya_transport_lokal: {
        type: Sequelize.BIGINT,
        defaultValue : 0
      },
      biaya_akomodasi: {
        type: Sequelize.BIGINT,
        defaultValue : 0
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
    },{schema: 'pat'});
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("anggaran_perjalanan_dinas_lain");
  },
};
