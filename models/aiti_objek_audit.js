"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class aiti_objek_audit extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      aiti_objek_audit.belongsTo(models.jadwal_audit, {
        foreignKey: "jadwal_audit_id",
      });
    }
  }
  aiti_objek_audit.init(
    {
      jadwal_audit_id: DataTypes.BIGINT,
      tipe_objek: DataTypes.JSON,
      objek: DataTypes.JSON,
      deskripsi: DataTypes.TEXT,
      attachments: DataTypes.ARRAY(DataTypes.STRING),
      create_by: DataTypes.JSON,
      update_by: DataTypes.JSON,
    },
    {
      sequelize,
      modelName: "aiti_objek_audit",
      schema: "pat",
    }
  );
  return aiti_objek_audit;
};
