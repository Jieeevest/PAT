"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable(
      "comment_adendum",
      {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.BIGINT,
        },
        parent_comment_id: {
          type: Sequelize.BIGINT,
        },
        pat_id: {
          type: Sequelize.BIGINT,
        },
        ref_bab_pat_kode: {
          type: Sequelize.INTEGER,
        },
        deskripsi: {
          type: Sequelize.TEXT,
        },
        create_by: {
          type: Sequelize.JSON,
        },
        update_by: {
          type: Sequelize.JSON,
        },
        is_closed: {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
        },
        adendum_no: {
          type: Sequelize.INTEGER,
        },
        create_at: {
          type: Sequelize.DATE,
          defaultValue: new Date(),
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
    await queryInterface.dropTable("comment_adendum");
  },
};
