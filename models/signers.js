"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class signers extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      signers.belongsTo(models.pat, { foreignKey: "pat_id" });
      signers.belongsTo(models.adendum_pat, { foreignKey: "pat_id" });
    }
  }
  signers.init(
    {
      pn: DataTypes.STRING,
      nama: DataTypes.STRING,
      pat_id: DataTypes.BIGINT,
      is_signed: DataTypes.BOOLEAN,
      adendum_no: DataTypes.INTEGER,
      create_by: DataTypes.JSON,
      update_by: DataTypes.JSON,
    },
    {
      sequelize,
      modelName: "signers",
      schema: "pat",
    }
  );
  return signers;
};
