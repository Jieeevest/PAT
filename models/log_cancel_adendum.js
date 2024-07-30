"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class log_cancel_adendum extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  log_cancel_adendum.init(
    {
      pat_id: DataTypes.BIGINT,
      create_by: DataTypes.JSON,
      adendum_no: DataTypes.INTEGER,
      note: DataTypes.TEXT,
    },
    {
      sequelize,
      modelName: "log_cancel_adendum",
      schema: "pat",
    }
  );
  return log_cancel_adendum;
};
