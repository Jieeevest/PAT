"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable(
      "log_persetujuan_reset_mcs",
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
        reset_id: {
          type: Sequelize.BIGINT,
        },
        adendum_no: {
          type: Sequelize.INTEGER,
          defaultValue: 0,
        },
        from: {
          type: Sequelize.JSON,
        },
        to: {
          type: Sequelize.JSON,
        },
        note: {
          type: Sequelize.TEXT,
        },
        modul: {
          type: Sequelize.ENUM(
            "Uka",
            "Pusat",
            "Maker",
            "Maker-Adendum",
            "Uka-Adendum",
            "Pusat-Adendum"
          ),
        },
        is_approved: {
          type: Sequelize.BOOLEAN,
        },
        create_by: {
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
    await queryInterface.dropTable("log_persetujuan_reset_mcs");
  },
};
