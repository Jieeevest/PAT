"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class auditee_jadwal_audit extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      auditee_jadwal_audit.belongsTo(models.jadwal_audit, {
        foreignKey: "jadwal_audit_id",
      });
    }
  }
  auditee_jadwal_audit.init(
    {
      jadwal_audit_id: DataTypes.BIGINT,
      ref_auditee_branch_kode: DataTypes.INTEGER,
      ref_auditee_branch_name: DataTypes.STRING,
      ref_auditee_orgeh_kode: DataTypes.STRING,
      ref_auditee_orgeh_name: DataTypes.STRING,
      tipe_uker: DataTypes.STRING,
      metode_pemantauan: DataTypes.JSON,
      deskripsi: DataTypes.TEXT,
      attachments: DataTypes.ARRAY(DataTypes.STRING),
      create_by: DataTypes.JSON,
      update_by: DataTypes.JSON,
    },
    {
      sequelize,
      modelName: "auditee_jadwal_audit",
      schema: "pat",
    }
  );
  return auditee_jadwal_audit;
};
