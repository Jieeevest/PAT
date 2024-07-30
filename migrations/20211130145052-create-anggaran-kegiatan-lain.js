"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable(
      "anggaran_kegiatan_lain",
      {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.BIGINT,
        },
        kegiatan_lain_id: {
          type: Sequelize.BIGINT,
        },
        ref_sub_kategori_anggaran_kode: {
          type: Sequelize.JSON,
        },
        amount: {
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
      },
      { schema: "pat" }
    );
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("anggaran_kegiatan_lain");
  },
};
