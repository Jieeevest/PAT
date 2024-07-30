"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable(
      "ref_ata_uker",
      {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.BIGINT,
        },
        orgeh_kode: {
          type: Sequelize.STRING,
        },
        orgeh_name: {
          type: Sequelize.STRING,
        },
        branch_kode: {
          type: Sequelize.INTEGER,
        },
        branch_name: {
          type: Sequelize.STRING,
        },
        tim_audit_id: {
          type: Sequelize.BIGINT,
        },
        ref_tim_audit_ata_id: {
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
    await queryInterface.dropTable("ref_ata_uker");
  },
};
