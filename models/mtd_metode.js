"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class mtd_metode extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      mtd_metode.hasMany(models.mtd_tipe, { as: "mtd_tipe", foreignKey: "mtd_metode_kode"})
      // define association here
    }
  }
  mtd_metode.init(
    {
      kode: { type: DataTypes.STRING, allowNull: false, primaryKey: true },
      nama: DataTypes.STRING,
      mtd_dimensi_kode: DataTypes.STRING,
      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      create_by: DataTypes.JSON,
      update_by: DataTypes.JSON,
    },
    {
      sequelize,
      modelName: "mtd_metode",
      schema: "reference",
    }
  );
  mtd_metode.removeAttribute("id");
  return mtd_metode;
};
