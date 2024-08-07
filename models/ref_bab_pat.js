"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class ref_bab_pat extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  ref_bab_pat.init(
    {
      kode: DataTypes.INTEGER,
      nomor: DataTypes.INTEGER,
      nama: DataTypes.STRING,
      create_by: DataTypes.JSON,
      update_by: DataTypes.JSON,
      is_active: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      modelName: "ref_bab_pat",
      schema : "pat"
    }
  );
  return ref_bab_pat;
};
