"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class data_adendum extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  data_adendum.init(
    {
      adendum_id: DataTypes.BIGINT,
      part: DataTypes.ENUM(
        "latar_belakang",
        "sumber_informasi",
        "tim_audit",
        "jadwal_audit",
        "jadwal_sbp",
        "kegiatan_lain"
      ),
      sebelum: DataTypes.JSON,
      sesudah: DataTypes.JSON,
      alasan_adendum: DataTypes.TEXT,
    },
    {
      sequelize,
      modelName: "data_adendum",
      schema: "pat",
    }
  );
  return data_adendum;
};
