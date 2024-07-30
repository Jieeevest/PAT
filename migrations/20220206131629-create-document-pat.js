"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable(
      "document_pat",
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
        dokumen: {
          type: Sequelize.STRING,
        },
        tanggal_document: {
          type: Sequelize.DATE,
        },
        adendum_no: {
          type: Sequelize.INTEGER,
        },
        nama_lampiran: {
          type: Sequelize.STRING,
        },
        document_location: {
          type: Sequelize.STRING,
        },
        document_status: {
          type: Sequelize.ENUM("Waiting", "Success", "Failed"),
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
    await queryInterface.dropTable("document_pat");
  },
};
