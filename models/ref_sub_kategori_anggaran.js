"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class ref_sub_kategori_anggaran extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      ref_sub_kategori_anggaran.belongsTo(models.ref_kategori_anggaran, {
        foreignKey: "ref_kategori_anggaran_id",
      });
      ref_sub_kategori_anggaran.hasMany(models.anggaran_kegiatan_jadwal_audit, {
        foreignKey: "ref_sub_kategori_anggaran_kode",
      });
      ref_sub_kategori_anggaran.hasMany(models.anggaran_kegiatan_lain, {
        foreignKey: "ref_sub_kategori_anggaran_kode",
      });
      ref_sub_kategori_anggaran.hasMany(models.anggaran_kegiatan_sbp, {
        foreignKey: "ref_sub_kategori_anggaran_kode",
      });
    }
  }
  ref_sub_kategori_anggaran.init(
    {
      ref_kategori_anggaran_id: DataTypes.INTEGER,
      nama: DataTypes.STRING,
      create_by: DataTypes.JSON,
      update_by: DataTypes.JSON,
      is_active: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      modelName: "ref_sub_kategori_anggaran",
      schema: "pat",
    }
  );
  return ref_sub_kategori_anggaran;
};
