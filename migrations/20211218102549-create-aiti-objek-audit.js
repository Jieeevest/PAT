"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable(
      "aiti_objek_audit",
      {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.BIGINT,
        },
        jadwal_audit_id: {
          type: Sequelize.BIGINT,
          foreignKey: true,
        },
        tipe_objek: {
          type: Sequelize.JSON,
        },
        objek: {
          type: Sequelize.JSON,
        },
        deskripsi: {
          type: Sequelize.TEXT,
        },
        attachments: {
          type: Sequelize.ARRAY(Sequelize.STRING),
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
    await queryInterface.dropTable("aiti_objek_audit");
  },
};
