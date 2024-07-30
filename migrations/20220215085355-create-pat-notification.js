"use strict";


module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable(
      "pat_notification",
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
        jenis: {
          type: Sequelize.STRING,
        },
        dari: {
          type: Sequelize.JSON,
        },
        untuk: {
          type: Sequelize.JSON,
        },
        perihal: {
          type: Sequelize.STRING,
        },
        read: {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
        },
        adendum_no: {
          type: Sequelize.INTEGER,
        },
        is_adendum: {
          type: Sequelize.BOOLEAN,
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
    await queryInterface.dropTable("pat_notification");
  },
};
