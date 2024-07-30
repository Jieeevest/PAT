'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class request_reset_pat_log_persetujuan extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  request_reset_pat_log_persetujuan.init({
    reset_pat_id: DataTypes.BIGINT,
    from: DataTypes.JSON,
    to: DataTypes.JSON,
    is_signed: DataTypes.BOOLEAN,
    note: DataTypes.TEXT,
    create_by: DataTypes.JSON,
    update_by: DataTypes.JSON
  }, {
    sequelize,
    modelName: 'request_reset_pat_log_persetujuan',
    schema: "pat"
  });
  return request_reset_pat_log_persetujuan;
};