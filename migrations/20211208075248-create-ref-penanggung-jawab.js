"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable(
      "ref_penanggung_jawab",
      {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.BIGINT,
        },
        pn: {
          type: Sequelize.STRING,
        },
        nama: {
          type: Sequelize.STRING,
        },
        jabatan: {
          type: Sequelize.STRING,
        },
        jadwal_sbp_id: {
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
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("ref_penanggung_jawab");
  },
};
