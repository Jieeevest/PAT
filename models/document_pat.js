"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class document_pat extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  document_pat.init(
    {
      pat_id: DataTypes.BIGINT,
      dokumen: DataTypes.STRING,
      tanggal_document: DataTypes.DATE,
      adendum_no: DataTypes.INTEGER,
      nama_lampiran: DataTypes.STRING,
      document_location: DataTypes.STRING,
      document_status: DataTypes.ENUM("Success", "Failed", "Waiting"),
    },
    {
      sequelize,
      modelName: "document_pat",
      schema: "pat",
    }
  );
  return document_pat;
};
