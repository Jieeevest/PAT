"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable(
      "adendum_pat",
      {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.BIGINT,
        },
        pat_id: {
          type: Sequelize.BIGINT,
          foreignKey: true,
        },
        by: {
          type: Sequelize.JSON,
        },
        adendum_no: {
          type: Sequelize.INTEGER,
        },
        time: {
          type: Sequelize.DATE,
        },
        status_approver: Sequelize.JSON,
        pn_maker_akhir: {
          type: Sequelize.JSON,
        },
        pn_maker_pusat: {
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
    await queryInterface.dropTable("adendum_pat");
  },
};
