"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class log_changes_user_skai extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  log_changes_user_skai.init(
    {
        changed_data: DataTypes.JSON,
        pn: DataTypes.STRING

    },
    {
      sequelize,
      modelName: "log_changes_user_skai",
      tableName: 'log_changes_user_skai',
      schema: "reference",
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'update_at'
    }
  );
  return log_changes_user_skai;
};