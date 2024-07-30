"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class anggaran_kegiatan_sbp extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      anggaran_kegiatan_sbp.belongsTo(models.jadwal_sbp, {
        foreignKey: "jadwal_sbp_id",
      });
      anggaran_kegiatan_sbp.belongsTo(models.ref_sub_kategori_anggaran, {
        foreignKey: "ref_sub_kategori_anggaran_kode",
      });
    }
  }
  anggaran_kegiatan_sbp.init(
    {
      jadwal_sbp_id: DataTypes.BIGINT,
      ref_sub_kategori_anggaran_kode: DataTypes.JSON,
      amount: DataTypes.BIGINT,
      create_by: DataTypes.JSON,
      update_by: DataTypes.JSON,
    },
    {
      sequelize,
      modelName: "anggaran_kegiatan_sbp",
      schema: "pat",
    }
  );
  return anggaran_kegiatan_sbp;
};
