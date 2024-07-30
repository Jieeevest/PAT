"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class mtd_tema extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // mtd_tema.belongsTo(models.mtd_jenis, { as : "mtd_tema", foreignKey: "mtd_jenis_kode"})
      // define association here
    }
  }
  mtd_tema.init(
    {
      kode: { type: DataTypes.STRING, allowNull: false, primaryKey: true },
      nama: DataTypes.STRING,
      mtd_jenis_kode: DataTypes.STRING,
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
      modelName: "mtd_tema",
      schema: "reference",
    }
  );
  mtd_tema.removeAttribute("id");
  return mtd_tema;
};
