"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class anggota_kegiatan_lain extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      anggota_kegiatan_lain.belongsTo(models.kegiatan_lain, {
        foreignKey: "kegiatan_lain_id",
      });
    }
  }
  anggota_kegiatan_lain.init(
    {
      pn_anggota: DataTypes.STRING,
      nama_anggota: DataTypes.STRING,
      jabatan: DataTypes.STRING,
      kegiatan_lain_id: DataTypes.BIGINT,
      create_by: DataTypes.JSON,
      update_by: DataTypes.JSON,
    },
    {
      sequelize,
      modelName: "anggota_kegiatan_lain",
      schema: "pat",
    }
  );
  return anggota_kegiatan_lain;
};
