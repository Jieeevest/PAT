"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("ref_sub_kategori_anggaran", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      ref_kategori_anggaran_id: {
        type: Sequelize.INTEGER,
        foreignKey : true
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
        defaultValue : true
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
    await queryInterface.dropTable("ref_sub_kategori_anggaran");
  },
};
