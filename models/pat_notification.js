"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class pat_notification extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  pat_notification.init(
    {
      pat_id: DataTypes.BIGINT,
      jenis: DataTypes.STRING,
      dari: DataTypes.JSON,
      untuk: DataTypes.JSON,
      perihal: DataTypes.STRING,
      read: DataTypes.BOOLEAN,
      adendum_no: DataTypes.INTEGER,
      is_adendum: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      modelName: "pat_notification",
      schema: "pat",
    }
  );
  return pat_notification;
};
