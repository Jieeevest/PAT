"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable(
      "data_adendum",
      {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.BIGINT,
        },
        adendum_id: {
          type: Sequelize.BIGINT,
        },
        part: {
          type: Sequelize.ENUM(
            "latar_belakang",
            "sumber_informasi",
            "tim_audit",
            "jadwal_audit",
            "jadwal_sbp",
            "kegiatan_lain"
          ),
        },
        sebelum: {
          type: Sequelize.JSON,
        },
        sesudah: {
          type: Sequelize.JSON,
        },
        alasan_adendum: {
          type: Sequelize.TEXT,
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
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("data_adendum");
  },
};
