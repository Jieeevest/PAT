"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class ref_penanggung_jawab extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      ref_penanggung_jawab.belongsTo(models.jadwal_sbp, {
        foreignKey: "jadwal_sbp_id",
      });
    }
  }
  ref_penanggung_jawab.init(
    {
      pn: DataTypes.STRING,
      nama: DataTypes.STRING,
      jabatan: DataTypes.STRING,
      jadwal_sbp_id: DataTypes.BIGINT,
      create_by: DataTypes.JSON,
      update_by: DataTypes.JSON,
    },
    {
      sequelize,
      modelName: "ref_penanggung_jawab",
      schema: "pat",
    }
  );
  return ref_penanggung_jawab;
};
