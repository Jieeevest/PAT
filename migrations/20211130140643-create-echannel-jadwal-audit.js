"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("echannel_jadwal_audit", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT,
      },
      jadwal_audit_id: {
        type: Sequelize.BIGINT,
      },
      ref_echanel_type_kode: {
        type: Sequelize.JSON,
      },
      jumlah_existing: {
        type: Sequelize.INTEGER,
      },
      jumlah_target: {
        type: Sequelize.INTEGER,
      },
      posisi_data: {
        type: Sequelize.DATE,
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
    await queryInterface.dropTable("echannel_jadwal_audit");
  },
};
