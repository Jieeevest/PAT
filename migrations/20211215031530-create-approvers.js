"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable(
      "approvers",
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
        pat_id: {
          type: Sequelize.BIGINT,
          foreignKey: true,
        },
        is_signed: {
          type: Sequelize.BOOLEAN,
        },
        adendum_no: {
          type: Sequelize.INTEGER,
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
    await queryInterface.dropTable("approvers");
  },
};
