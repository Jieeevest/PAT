"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class tim_audit extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      tim_audit.hasMany(models.jadwal_audit, {
        foreignKey: "tim_audit_id",
        onDelete: "CASCADE",
      });
      tim_audit.belongsTo(models.pat, {
        foreignKey: "pat_id",
      });
      tim_audit.hasMany(models.ref_tim_audit_ata, {
        foreignKey: "tim_audit_id",
        onDelete: "CASCADE",
      });
      tim_audit.hasMany(models.ref_tim_audit_ma, {
        foreignKey: "tim_audit_id",
        onDelete: "CASCADE",
      });
      tim_audit.hasMany(models.ref_tim_audit_kta, {
        foreignKey: "tim_audit_id",
        onDelete: "CASCADE",
      });
    }
  }
  tim_audit.init(
    {
      pat_id: DataTypes.BIGINT,
      name: DataTypes.STRING,
      ref_tipe_tim: DataTypes.JSON,
      pic_maker_tim_audit: DataTypes.JSON,
      create_by: DataTypes.JSON,
      update_by: DataTypes.JSON,
    },
    {
      sequelize,
      modelName: "tim_audit",
      schema: "pat",
    }
  );
  return tim_audit;
};
