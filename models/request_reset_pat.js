'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class request_reset_pat extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      request_reset_pat.hasMany(models.request_reset_pat_log_persetujuan, { foreignKey: "reset_pat_id"})
      request_reset_pat.hasMany(models.approvers_request_pat, { foreignKey: "reset_pat_id"})
    }
  }
  request_reset_pat.init({
    pat_id: DataTypes.BIGINT,
    initiator: DataTypes.JSON,
    status_persetujuan: DataTypes.STRING,
    status_approver: DataTypes.JSON,
    note: DataTypes.TEXT,
    create_by: DataTypes.JSON,
    update_by: DataTypes.JSON
  }, {
    sequelize,
    modelName: 'request_reset_pat',
    schema: 'pat'
  });
  return request_reset_pat;
};