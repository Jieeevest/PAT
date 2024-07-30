"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class comment_adendum extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  comment_adendum.init(
    {
      parent_comment_id: DataTypes.BIGINT,
      pat_id: DataTypes.BIGINT,
      ref_bab_pat_kode: DataTypes.INTEGER,
      deskripsi: DataTypes.TEXT,
      create_by: DataTypes.JSON,
      update_by: DataTypes.JSON,
      is_closed: DataTypes.BOOLEAN,
      adendum_no: DataTypes.INTEGER,
      create_at: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: "comment_adendum",
      schema: "pat",
    }
  );
  return comment_adendum;
};
