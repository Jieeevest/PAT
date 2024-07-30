"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class target_audit extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      target_audit.belongsTo(models.pat, {
        foreignKey: "pat_id",
      });
    }
  }
  target_audit.init(
    {
      pat_id: DataTypes.BIGINT,
      uker_existing_adjustment: DataTypes.JSONB,
      create_by: DataTypes.STRING,
      update_by: DataTypes.STRING,
      createdAt: {
        type: DataTypes.DATE,
        defaultValue: new Date(),
      },
      updatedAt: {
        type: DataTypes.DATE,
        defaultValue: new Date(),
      },
    },
    {
      sequelize,
      modelName: "target_audit",
      schema : "pat"
    }
  );
  return target_audit;
};
