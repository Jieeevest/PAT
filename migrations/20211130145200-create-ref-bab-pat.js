"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("ref_bab_pat", {
      kode: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      nomor: {
        type: Sequelize.INTEGER,
      },
      nama: {
        type: Sequelize.STRING,
      },
      create_by: {
        type: Sequelize.JSON,
      },
      update_by: {
        type: Sequelize.JSON,
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
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
    },{schema: 'pat'});
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("ref_bab_pat");
  },
};
