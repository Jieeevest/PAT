"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable(
      "log_persetujuan_adendum",
      {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.BIGINT,
        },
        from: {
          type: Sequelize.JSON,
        },
        to: {
          type: Sequelize.JSON,
        },
        pat_id: {
          type: Sequelize.BIGINT,
        },
        note: {
          type: Sequelize.TEXT,
        },
        adendum_no: {
          type: Sequelize.INTEGER,
        },
        is_approved: {
          type: Sequelize.BOOLEAN,
        },
        belongs_to: {
          type: Sequelize.ENUM("UKA", "PUSAT"),
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
    await queryInterface.dropTable("log_persetujuan_adendum");
  },
};
