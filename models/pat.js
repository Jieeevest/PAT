"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class pat extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      pat.hasMany(models.tim_audit, { foreignKey: "pat_id" });
      pat.hasMany(models.signers, { foreignKey: "pat_id" });
      pat.hasMany(models.approvers, { foreignKey: "pat_id" });
      pat.hasMany(models.log_persetujuan_pat, { foreignKey: "pat_id" });
      pat.hasMany(models.log_persetujuan_adendum, { foreignKey: "pat_id" });
      pat.hasMany(models.log_persetujuan_reset_mcs, { foreignKey: "pat_id" });
      pat.hasMany(models.request_reset_pat, { foreignKey: "pat_id" });
    }
  }
  pat.init(
    {
      name: DataTypes.STRING,
      tahun: DataTypes.INTEGER,
      uka_kode: DataTypes.STRING,
      uka_name: DataTypes.STRING,
      riwayat_adendum: DataTypes.INTEGER,
      latar_belakang: DataTypes.TEXT,
      pic_latar_belakang_tujuan: DataTypes.JSON,
      sumber_informasi: DataTypes.TEXT,
      pic_sumber_informasi: DataTypes.JSON,
      temp_content_page_file_doc_pat: DataTypes.STRING,
      temp_sign_page_file_doc_pat: DataTypes.STRING,
      file_doc_pat: DataTypes.STRING,
      pn_maker_akhir: DataTypes.JSON,
      pn_maker_pusat: DataTypes.JSON,
      status_pat: DataTypes.ENUM(
        "Final",
        "On Progress",
        "On Approver",
        "On Adendum"
      ),
      status_approver: DataTypes.JSON,
      create_by: DataTypes.JSON,
      update_by: DataTypes.JSON,
      access: DataTypes.ARRAY(DataTypes.STRING),
      lb_created_at: DataTypes.DATE,
      lb_updated_at: DataTypes.DATE,
      si_created_at: DataTypes.DATE,
      si_updated_at: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: "pat",
      schema: "pat",
    }
  );
  return pat;
};
