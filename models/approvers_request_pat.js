'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class approvers_request_pat extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  approvers_request_pat.init({
    pn: DataTypes.STRING,
    nama: DataTypes.STRING,
    reset_pat_id: DataTypes.BIGINT,
    is_signed: DataTypes.BOOLEAN,
    create_by: DataTypes.JSON,
    update_by: DataTypes.JSON
  }, {
    sequelize,
    modelName: 'approvers_request_pat',
    schema: 'pat'
  });
  return approvers_request_pat;
};