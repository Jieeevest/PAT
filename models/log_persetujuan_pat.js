"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class log_persetujuan_pat extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      log_persetujuan_pat.belongsTo(models.pat, { foreignKey: "pat_id" });
    }
  }
  log_persetujuan_pat.init(
    {
      from: DataTypes.JSON,
      to: DataTypes.JSON,
      pat_id: DataTypes.BIGINT,
      note: DataTypes.TEXT,
      is_approved: DataTypes.BOOLEAN,
      belongs_to : DataTypes.ENUM("UKA","PUSAT"),
      create_by: DataTypes.JSON,
      update_by: DataTypes.JSON,
    },
    {
      sequelize,
      modelName: "log_persetujuan_pat",
      schema: "pat",
    }
  );
  return log_persetujuan_pat;
};
