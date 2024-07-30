"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class ref_penanggung_jawab_kegiatan_lain extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      ref_penanggung_jawab_kegiatan_lain.belongsTo(models.kegiatan_lain, {
        foreignKey: "kegiatan_lain_id",
      });
      // define association here
    }
  }
  ref_penanggung_jawab_kegiatan_lain.init(
    {
      pn: DataTypes.STRING,
      nama: DataTypes.STRING,
      kegiatan_lain_id: DataTypes.BIGINT,
      create_by: DataTypes.JSON,
      update_by: DataTypes.JSON,
    },
    {
      sequelize,
      modelName: "ref_penanggung_jawab_kegiatan_lain",
      schema: "pat",
    }
  );
  return ref_penanggung_jawab_kegiatan_lain;
};
