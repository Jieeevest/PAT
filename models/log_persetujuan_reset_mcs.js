"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class log_persetujuan_reset_mcs extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      log_persetujuan_reset_mcs.belongsTo(models.pat, { foreignKey: "pat_id" });
      log_persetujuan_reset_mcs.belongsTo(models.reset_mcs, {
        foreignKey: "reset_id",
      });
    }
  }
  log_persetujuan_reset_mcs.init(
    {
      pat_id: DataTypes.BIGINT,
      reset_id: DataTypes.BIGINT,
      from: DataTypes.JSON,
      to: DataTypes.JSON,
      note: DataTypes.TEXT,
      modul: DataTypes.ENUM(
        "Uka",
        "Pusat",
        "Maker",
        "Maker-Adendum",
        "Uka-Adendum",
        "Pusat-Adendum"
      ),
      is_approved: DataTypes.BOOLEAN,
      create_by: DataTypes.JSON,
    },
    {
      sequelize,
      modelName: "log_persetujuan_reset_mcs",
      schema: "pat",
    }
  );
  return log_persetujuan_reset_mcs;
};
