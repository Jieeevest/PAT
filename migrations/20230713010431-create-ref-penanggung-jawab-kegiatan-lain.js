"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      "ref_penanggung_jawab_kegiatan_lain",
      {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER,
        },
        pn: {
          type: Sequelize.STRING,
        },
        nama: {
          type: Sequelize.STRING,
        },
        kegiatan_lain_id: {
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
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("ref_penanggung_jawab_kegiatan_lain");
  },
};
