"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable(
      "pat",
      {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.BIGINT,
        },
        name: {
          type: Sequelize.STRING,
        },
        tahun: {
          type: Sequelize.INTEGER,
        },
        uka_kode: {
          type: Sequelize.STRING,
        },
        uka_name: {
          type: Sequelize.STRING,
        },
        riwayat_adendum: {
          type: Sequelize.INTEGER,
          defaultValue: 0,
        },
        latar_belakang: {
          type: Sequelize.TEXT,
        },
        pic_latar_belakang_tujuan: {
          type: Sequelize.JSON,
        },
        sumber_informasi: {
          type: Sequelize.TEXT,
        },
        pic_sumber_informasi: {
          type: Sequelize.JSON,
        },
        temp_content_page_file_doc_pat: {
          type: Sequelize.STRING,
        },
        temp_sign_page_file_doc_pat: {
          type: Sequelize.STRING,
        },
        file_doc_pat: {
          type: Sequelize.STRING,
        },
        pn_maker_akhir: {
          type: Sequelize.JSON,
        },
        pn_maker_pusat: {
          type: Sequelize.JSON,
        },
        status_pat: {
          type: Sequelize.ENUM(
            "Final",
            "On Progress",
            "On Approver",
            "On Adendum"
          ),
        },
        create_by: {
          type: Sequelize.JSON,
        },
        update_by: {
          type: Sequelize.JSON,
        },
        access: {
          type: Sequelize.ARRAY(Sequelize.STRING),
        },
        status_approver: {
          type: Sequelize.JSON,
        },
        lb_created_at: {
          type: Sequelize.DATE,
        },
        lb_updated_at: {
          type: Sequelize.DATE,
        },
        si_created_at: {
          type: Sequelize.DATE,
        },
        si_updated_at: {
          type: Sequelize.DATE,
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
    await queryInterface.dropTable("pat");
  },
};
