"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class echannel_jadwal_audit extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      echannel_jadwal_audit.belongsTo(models.jadwal_audit, {
        foreignKey: "jadwal_audit_id",
      });
    }
  }
  echannel_jadwal_audit.init(
    {
      jadwal_audit_id: DataTypes.BIGINT,
      ref_echanel_type_kode: DataTypes.JSON,
      jumlah_existing: DataTypes.INTEGER,
      jumlah_target: DataTypes.INTEGER,
      posisi_data: DataTypes.DATE,
      create_by: DataTypes.JSON,
      update_by: DataTypes.JSON,
    },
    {
      sequelize,
      modelName: "echannel_jadwal_audit",
      schema: "pat",
    }
  );
  return echannel_jadwal_audit;
};
