"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class anggaran_perjalanan_dinas_lain extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      anggaran_perjalanan_dinas_lain.belongsTo(models.kegiatan_lain, {
        foreignKey: "kegiatan_lain_id",
      });
      // define association here
    }
  }
  anggaran_perjalanan_dinas_lain.init(
    {
      kegiatan_lain_id: DataTypes.BIGINT,
      pn_auditor: DataTypes.JSON,
      lama_kegiatan: DataTypes.INTEGER,
      biaya_perjalanan_hari: DataTypes.BIGINT,
      biaya_tiket_pp: DataTypes.BIGINT,
      biaya_transport_lokal: DataTypes.BIGINT,
      biaya_akomodasi: DataTypes.BIGINT,
      create_by: DataTypes.JSON,
      update_by: DataTypes.JSON,
    },
    {
      sequelize,
      modelName: "anggaran_perjalanan_dinas_lain",
      schema: "pat",
    }
  );
  return anggaran_perjalanan_dinas_lain;
};
