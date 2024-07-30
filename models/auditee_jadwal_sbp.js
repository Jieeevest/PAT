"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class auditee_jadwal_sbp extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      auditee_jadwal_sbp.belongsTo(models.jadwal_sbp, {
        foreignKey: "jadwal_sbp_id",
      });
      // define association here
    }
  }
  auditee_jadwal_sbp.init(
    {
      jadwal_sbp_id: DataTypes.BIGINT,
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
      modelName: "auditee_jadwal_sbp",
      schema: "pat",
    }
  );
  return auditee_jadwal_sbp;
};
