"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class reset_mcs extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      reset_mcs.hasMany(models.log_persetujuan_reset_mcs, {
        foreignKey: "reset_id",
      });
    }
  }
  reset_mcs.init(
    {
      pat_id: DataTypes.BIGINT,
      modul: DataTypes.ENUM(
        "Uka",
        "Pusat",
        "Maker",
        "Maker-Adendum",
        "Uka-Adendum",
        "Pusat-Adendum"
      ),
      status: DataTypes.ENUM("Waiting-For-Approval", "Final"),
      note: DataTypes.TEXT,
      adendum_no: DataTypes.INTEGER,
      pic_approval: DataTypes.JSON,
      create_by: DataTypes.JSON,
      update_by: DataTypes.JSON,
    },
    {
      sequelize,
      modelName: "reset_mcs",
      schema: "pat",
    }
  );
  return reset_mcs;
};
