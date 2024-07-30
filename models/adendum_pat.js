"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class adendum_pat extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      adendum_pat.hasMany(models.tim_audit, { foreignKey: "pat_id" });
      adendum_pat.hasMany(models.signers, { foreignKey: "pat_id" });
      adendum_pat.hasMany(models.approvers, { foreignKey: "pat_id" });
      adendum_pat.hasMany(models.log_persetujuan_pat, { foreignKey: "pat_id" });
    }
  }
  adendum_pat.init(
    {
      pat_id: DataTypes.BIGINT,
      by: DataTypes.JSON,
      adendum_no: DataTypes.INTEGER,
      time: DataTypes.DATE,
      pn_maker_akhir: DataTypes.JSON,
      pn_maker_pusat: DataTypes.JSON,
      status_approver: DataTypes.JSON,
    },
    {
      sequelize,
      modelName: "adendum_pat",
      schema: "pat",
    }
  );
  return adendum_pat;
};
