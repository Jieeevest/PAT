"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class ref_tim_audit_ma extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      ref_tim_audit_ma.belongsTo(models.tim_audit, {
        foreignKey: "tim_audit_id",
      });
      // define association here
    }
  }
  ref_tim_audit_ma.init(
    {
      pn_ma: DataTypes.STRING,
      nama_ma: DataTypes.STRING,
      jabatan: DataTypes.STRING,
      tim_audit_id: DataTypes.BIGINT,
      create_by: DataTypes.JSON,
      update_by: DataTypes.JSON,
    },
    {
      sequelize,
      modelName: "ref_tim_audit_ma",
      schema: "pat",
    }
  );
  return ref_tim_audit_ma;
};
