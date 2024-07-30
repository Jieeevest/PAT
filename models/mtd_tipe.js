"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class mtd_tipe extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    // model mtd_tipe.js
static associate(models) {
  mtd_tipe.belongsTo(models.mtd_metode, { as: "mtd_tipe", foreignKey: "mtd_metode_kode"})
  mtd_tipe.hasMany(models.mtd_jenis, { as: "mtd_jenis", foreignKey: "mtd_tipe_kode", foreignKeyConstraint: "kode" });
}
  }
  mtd_tipe.init(
    {
      kode: { type: DataTypes.STRING, allowNull: false, primaryKey: true },
      nama: DataTypes.STRING,
      mtd_metode_kode: DataTypes.STRING,
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
      modelName: "mtd_tipe",
      schema: "reference",
    }
  );
  mtd_tipe.removeAttribute("id");
  // mtd_tipe.removeAttribute("id");
  return mtd_tipe;
};
