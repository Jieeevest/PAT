"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class ref_tim_audit_ata extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      ref_tim_audit_ata.belongsTo(models.tim_audit, {
        foreignKey: "tim_audit_id",
      });
      ref_tim_audit_ata.hasMany(models.ref_ata_uker, {
        foreignKey: "ref_tim_audit_ata_id",
      });
    }
  }
  ref_tim_audit_ata.init(
    {
      pn_ata: DataTypes.STRING,
      nama_ata: DataTypes.STRING,
      jabatan: DataTypes.STRING,
      tim_audit_id: DataTypes.BIGINT,
      create_by: DataTypes.JSON,
      update_by: DataTypes.JSON,
    },
    {
      sequelize,
      modelName: "ref_tim_audit_ata",
      schema: "pat",
    }
  );
  return ref_tim_audit_ata;
};
