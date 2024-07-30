"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable(
      "log_persetujuan_pat",
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
          foreignKey: true,
        },
        note: {
          type: Sequelize.TEXT,
        },
        belongs_to : {
          type : Sequelize.ENUM("UKA","PUSAT")
        },
        create_by: {
          type: Sequelize.JSON,
        },
        update_by: {
          type: Sequelize.JSON,
        },
        is_approved: {
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
    await queryInterface.dropTable("log_persetujuan_pat");
  },
};
