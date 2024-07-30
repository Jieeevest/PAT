"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class ref_ata_uker extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      ref_ata_uker.belongsTo(models.ref_tim_audit_ata, {
        foreignKey: "ref_tim_audit_ata_id",
      });
    }
  }
  ref_ata_uker.init(
    {
      orgeh_kode: DataTypes.STRING,
      orgeh_name: DataTypes.STRING,
      branch_kode: DataTypes.INTEGER,
      branch_name: DataTypes.STRING,
      ref_tim_audit_ata_id: DataTypes.INTEGER,
      tim_audit_id: DataTypes.BIGINT,
      create_by: DataTypes.JSON,
      update_by: DataTypes.JSON,
    },
    {
      sequelize,
      modelName: "ref_ata_uker",
      schema: "pat",
    }
  );
  return ref_ata_uker;
};
