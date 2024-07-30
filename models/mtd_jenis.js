"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class mtd_jenis extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    // model mtd_jenis.js
static associate(models) {
  mtd_jenis.hasMany(models.mtd_tema, { as: "mtd_tema", foreignKey: "mtd_jenis_kode" });
}
  }
  mtd_jenis.init(
    {
      kode: { type: DataTypes.STRING, allowNull: false, primaryKey: true },
      nama: DataTypes.STRING,
      mtd_tipe_kode: DataTypes.STRING,
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
      modelName: "mtd_jenis",
      schema: "reference",
    }
  );
  mtd_jenis.removeAttribute("id");
  return mtd_jenis;
};
