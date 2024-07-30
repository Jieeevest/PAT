"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class jadwal_sbp extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      jadwal_sbp.hasMany(models.auditee_jadwal_sbp, {
        foreignKey: "jadwal_sbp_id",
      });
      jadwal_sbp.hasMany(models.anggaran_perjalanan_dinas_sbp, {
        foreignKey: "jadwal_sbp_id",
      });
      jadwal_sbp.hasMany(models.anggaran_kegiatan_sbp, {
        foreignKey: "jadwal_sbp_id",
      });
      jadwal_sbp.hasMany(models.ref_penanggung_jawab, {
        foreignKey: "jadwal_sbp_id",
      });
    }
  }
  jadwal_sbp.init(
    {
      nama: DataTypes.STRING,
      pat_id: DataTypes.BIGINT,
      ref_metode: DataTypes.JSON,
      ref_tipe: DataTypes.JSON,
      ref_jenis: DataTypes.JSON,
      ref_tema: DataTypes.JSON,
      pic_maker_jadwal_sbp: DataTypes.JSON,
      deskripsi: DataTypes.TEXT,
      count_target_jenis_auditee: DataTypes.JSON,
      pelaksanaan_start: DataTypes.DATE,
      pelaksanaan_end: DataTypes.DATE,
      total_anggaran: DataTypes.BIGINT,
      create_by: DataTypes.JSON,
      update_by: DataTypes.JSON,
    },
    {
      sequelize,
      modelName: "jadwal_sbp",
      schema: "pat",
    }
  );
  return jadwal_sbp;
};
