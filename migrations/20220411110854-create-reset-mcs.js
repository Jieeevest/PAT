"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable(
      "reset_mcs",
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
        adendum_no: {
          type: Sequelize.INTEGER,
          defaultValue: 0,
        },
        status: {
          type: Sequelize.ENUM("Waiting-For-Approval", "Final"),
          defautlValue: "Waiting-For-Approval",
        },
        note : {
          type : Sequelize.TEXT
        },
        pic_approval: {
          type: Sequelize.JSON,
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
          defautlValue: new Date(),
        },
      },
      { schema: "pat" }
    );
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("reset_mcs");
  },
};
