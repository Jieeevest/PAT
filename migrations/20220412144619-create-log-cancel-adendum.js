"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable(
      "log_cancel_adendum",
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
        create_by: {
          type: Sequelize.JSON,
        },
        adendum_no: {
          type: Sequelize.INTEGER,
        },
        note: {
          type: Sequelize.TEXT,
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
    await queryInterface.dropTable("log_cancel_adendum");
  },
};
