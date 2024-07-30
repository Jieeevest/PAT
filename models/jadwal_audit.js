const { Model, DATE } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class jadwal_audit extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      jadwal_audit.belongsTo(models.tim_audit, {
        foreignKey: "tim_audit_id",
      });
      jadwal_audit.hasMany(models.auditee_jadwal_audit, {
        foreignKey: "jadwal_audit_id",
      });
      jadwal_audit.hasMany(models.anggaran_perjalanan_dinas_jadwal_audit, {
        foreignKey: "jadwal_audit_id",
      });
      jadwal_audit.hasMany(models.anggaran_kegiatan_jadwal_audit, {
        foreignKey: "jadwal_audit_id",
      });
      jadwal_audit.hasMany(models.echannel_jadwal_audit, {
        foreignKey: "jadwal_audit_id",
      });
      jadwal_audit.hasMany(models.aiti_objek_audit, {
        foreignKey: "jadwal_audit_id",
      });
    }
  }
  jadwal_audit.init(
    {
      pat_id: DataTypes.BIGINT,
      tim_audit_id: DataTypes.BIGINT,
      ref_metode: DataTypes.JSON,
      ref_tipe: DataTypes.JSON,
      ref_jenis: DataTypes.JSON,
      ref_tema: DataTypes.JSON,
      name_kegiatan_audit: DataTypes.STRING,
      tema_audit: DataTypes.JSON,
      deskripsi: DataTypes.TEXT,
      count_target_jenis_auditee: DataTypes.JSON,
      pelaksanaan_start: DataTypes.DATE,
      pelaksanaan_end: DataTypes.DATE,
      pic_jadwal_audit: DataTypes.JSON,
      total_anggaran: DataTypes.BIGINT,
      create_by: DataTypes.JSON,
      update_by: DataTypes.JSON,
    },
    {
      sequelize,
      modelName: "jadwal_audit",
      schema: "pat",
    }
  );
  return jadwal_audit;
};
