"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class kegiatan_lain extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      kegiatan_lain.hasMany(models.auditee_kegiatan_lain, {
        foreignKey: "kegiatan_lain_id",
      });
      kegiatan_lain.hasMany(models.anggaran_perjalanan_dinas_lain, {
        foreignKey: "kegiatan_lain_id",
      });
      kegiatan_lain.hasMany(models.anggaran_kegiatan_lain, {
        foreignKey: "kegiatan_lain_id",
      });
      kegiatan_lain.hasMany(models.ref_penanggung_jawab_kegiatan_lain, {
        foreignKey: "kegiatan_lain_id",
      });
    }
  }
  kegiatan_lain.init(
    {
      nama: DataTypes.STRING,
      pat_id: DataTypes.BIGINT,
      ref_metode: DataTypes.JSON,
      ref_tipe: DataTypes.JSON,
      ref_jenis: DataTypes.JSON,
      ref_tema: DataTypes.JSON,
      count_target_jenis_auditee: DataTypes.JSON,
      pic_maker_kegiatan_lain: DataTypes.JSON,
      deskripsi: DataTypes.TEXT,
      total_anggaran: DataTypes.BIGINT,
      pelaksanaan_start: DataTypes.DATE,
      pelaksanaan_end: DataTypes.DATE,
      create_by: DataTypes.JSON,
      update_by: DataTypes.JSON,
    },
    {
      sequelize,
      modelName: "kegiatan_lain",
      schema: "pat",
    }
  );
  return kegiatan_lain;
};
