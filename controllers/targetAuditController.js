const {
  target_audit,
  sequelize,
  auditee_jadwal_audit,
  auditee_jadwal_sbp,
  jadwal_sbp,
  kegiatan_lain,
  mtd_metode,
  mtd_jenis,
  mtd_tipe,
  mtd_tema,
  auditee_kegiatan_lain,
  jadwal_audit,
} = require("../models");
const { pool } = require("../services/connection");
const { findPATbyId } = require("../utils/PAT");
const { QueryTypes, literal } = require("sequelize");
const { sendResponse } = require("../utils/errorReturn");

const queries = {
  allEchannel: `
  SELECT kode,name FROM reference.echannel_type
  `,
  allUkerByUka: `
  SELECT kode,nama as name, jumlah_existing FROM reference.mapping_uker_type 
  WHERE uka_kode = $1
  `,
  echannel: `
  SELECT jumlah_existing,jumlah_target
  FROM pat.echannel_jadwal_audit as e
  LEFT JOIN pat.jadwal_audit as j ON j.id = e.jadwal_audit_id
  LEFT JOIN pat.tim_audit as t ON t.id = j.tim_audit_id
  WHERE j.pat_id = $1 AND ref_echanel_type_kode->>'kode' = $2
  `,
  existingAIKP: {
    divisi: `
  SELECT COUNT(DISTINCT child)
  FROM reference.mst_orgeh as m
  WHERE my_name ilike 'divisi%' OR my_name ilike 'division%' OR my_name ilike '%divisi' OR my_name ilike '%division' 
  `,
    desk: `
  SELECT COUNT(DISTINCT child)
  FROM reference.mst_orgeh as m
  WHERE my_name ~* 'desk' 

  `,
    pa: "9", // 9 anak perusahaan
    ukln: "8", // 8 anak
    kck: "1", // 1 - kantor cabang khusus
    kcp: ` 
  SELECT COUNT(DISTINCT branch)
  from reference.mst_dwh_branch
  WHERE brdesc ilike 'kcp %'
  `,
    kk: `
  SELECT COUNT(DISTINCT branch)
  from reference.mst_dwh_branch
  WHERE brdesc ilike 'kk%' OR brdesc ilike 'kantor kas%'
  `,
    unit: `
  SELECT COUNT(DISTINCT branch)
  from reference.mst_dwh_branch
  WHERE brdesc ilike 'unit%'
  `,
  },
  targetAIKP: {
    divisi: `
    SELECT COUNT(DISTINCT child)
	  FROM pat.auditee_jadwal_audit as a
	  LEFT JOIN pat.jadwal_audit as j ON j.id = a.jadwal_audit_id
    LEFT JOIN pat.pat as pat ON pat.id = t.pat_id
    WHERE pat.id = $1 
    AND (my_name ilike 'divisi%' OR my_name ilike 'division%' OR my_name ilike '%divisi' OR my_name ilike '%division') 
    `,

    desk: `
    SELECT COUNT(DISTINCT child)
	  FROM pat.auditee_jadwal_audit as a
	  LEFT JOIN reference.mst_orgeh as m ON m.child = a.ref_auditee_orgeh
	  LEFT JOIN pat.jadwal_audit as j ON j.id = a.jadwal_audit_id
    LEFT JOIN pat.tim_audit as t ON t.id = j.tim_audit_id
    LEFT JOIN pat.pat as pat ON pat.id = t.pat_id
    WHERE pat.id = $1 AND my_name ilike 'desk%'
    `,
    pa: "0",
    ukln: "0",
    kck: "0",
    kcp: `
    SELECT count(DISTINCT a.ref_auditee_branch_kode)
    FROM pat.auditee_jadwal_audit a
    INNER JOIN pat.jadwal_audit as j ON j.id = a.jadwal_audit_id
    INNER JOIN pat.tim_audit as t ON t.id = j.tim_audit_id
    INNER JOIN pat.pat as pat ON pat.id = t.pat_id
    INNER JOIN reference.mst_dwh_branch as b ON b.branch = a.ref_auditee_branch_kode
    WHERE pat.id=$1 AND (brdesc ilike 'kcp%' OR brdesc ilike 'kantor cabang pembantu%')
    `,
    kk: `
    SELECT count(DISTINCT a.ref_auditee_branch_kode)
    FROM pat.auditee_jadwal_audit a
    INNER JOIN pat.jadwal_audit as j ON j.id = a.jadwal_audit_id
    INNER JOIN pat.tim_audit as t ON t.id = j.tim_audit_id
    INNER JOIN pat.pat as pat ON pat.id = t.pat_id
    INNER JOIN reference.mst_dwh_branch as b ON b.branch = a.ref_auditee_branch_kode
    WHERE pat.id=$1 AND (brdesc ilike 'kantor kas%' OR brdesc ilike 'KK%')
    `,
    unit: `
    SELECT count(DISTINCT a.ref_auditee_branch_kode)
    FROM pat.auditee_jadwal_audit a
    INNER JOIN pat.jadwal_audit as j ON j.id = a.jadwal_audit_id
    INNER JOIN pat.tim_audit as t ON t.id = j.tim_audit_id
    INNER JOIN pat.pat as pat ON pat.id = t.pat_id
    INNER JOIN reference.mst_dwh_branch as b ON b.branch = a.ref_auditee_branch_kode
    WHERE pat.id=$1 AND (brdesc ilike 'unit%' )
    `,
    tema: `
    SELECT CAST(tema_audit->> 'name' as Varchar) as tema_audit,brdesc,j.id as jadwal_audit_id , a.id as uker_id	
    FROM pat.auditee_jadwal_audit a
    INNER JOIN pat.jadwal_audit as j ON j.id = a.jadwal_audit_id
    INNER JOIN pat.tim_audit as t ON t.id = j.tim_audit_id
    INNER JOIN reference.mst_dwh_branch as b ON b.branch = a.ref_auditee_branch_kode
    WHERE pat_id=$1 AND tema_audit is not null
  `,
  },
  targetAIKPForJadwal: {
    divisi: `
    SELECT COUNT(DISTINCT child)
    FROM reference.mst_orgeh as m
    WHERE m.child = ANY($1)
    AND (my_name ilike 'divisi%' OR my_name ilike 'division%' OR my_name ilike '%divisi' OR my_name ilike '%division') 
    `,
    desk: `
    SELECT COUNT(DISTINCT child)
    FROM reference.mst_orgeh as m
    WHERE m.child  = ANY($1)
    AND my_name ilike 'desk%'
    `,
    pa: "0",
    ukln: "0",
    kcp: `
    SELECT  COUNT (DISTINCT brdesc)
    FROM reference.mst_dwh_branch
    WHERE branch = ANY($1)  AND brdesc ilike 'kcp %'
    `,
    kk: `
    SELECT  COUNT (DISTINCT brdesc)
    FROM reference.mst_dwh_branch
    WHERE branch = ANY($1)  AND brdesc ilike 'kk%'
    `,
    unit: `
    SELECT  COUNT (DISTINCT brdesc)
    FROM reference.mst_dwh_branch
    WHERE branch = ANY($1)  AND brdesc ilike 'unit%'
  `,
  },
};

const eChannelTargetAudit = async (pat_id, e) => {
  try {
    const r = await sequelize.query(queries.echannel, {
      bind: [pat_id, e.kode],
      type: QueryTypes.SELECT,
    });
    const exists = await Promise.all(r.map((e) => e.jumlah_existing));
    const targets = await Promise.all(r.map((e) => e.jumlah_target));

    let existing = 0;
    let target = 0;
    if (exists.length > 0) {
      existing = exists.reduce((a, b) => a + b);
    }
    if (targets.length > 0) {
      target = targets.reduce((a, b) => a + b);
    }
    const data = {
      kode: e.kode,
      name: e.name,
      target: target,
      existing: existing,
    };
    return data;
  } catch (e) {
    
    throw new Error();
  }
};
const ukerTargetAuditJadwal = async (pat_id, e, id, t) => {
  try {
    const findAuditee = await auditee_jadwal_audit.findAll({
      include: {
        model: jadwal_audit,
        where: {
          pat_id,
          id,
        },
      },
      where: {
        tipe_uker: e.kode,
      },
      transaction: t,
    });

    const data = {
      kode: e.kode,
      name: e.name,
      target: findAuditee?.length || 0,
      existing: e.jumlah_existing,
    };
    return data;
  } catch (e) {
    
    throw new Error();
  }
};
const ukerTargetAudit = async (pat_id, e) => {
  try {
    const findAuditee = await auditee_jadwal_audit.findAll({
      include: {
        model: jadwal_audit,
        where: {
          pat_id,
        },
      },
      where: {
        tipe_uker: e.kode,
      },
    });

    const data = {
      kode: e.kode,
      name: e.name,
      target: findAuditee?.length || 0,
      existing: e.jumlah_existing,
    };
    return data;
  } catch (e) {
    
    throw new Error();
  }
};
const ukerTargetSbp = async (pat_id, e, id, t) => {
  try {
    const findAuditee = await auditee_jadwal_sbp.findAll({
      include: {
        model: jadwal_sbp,
        where: {
          pat_id,
          id,
        },
      },
      where: {
        tipe_uker: e.kode,
      },
      transaction: t,
    });

    const data = {
      kode: e.kode,
      name: e.name,
      target: findAuditee?.length || 0,
      existing: e.jumlah_existing,
    };
    return data;
  } catch (e) {
    
    throw new Error();
  }
};
const ukerTargetLain = async (pat_id, e, id, t) => {
  try {
    const findAuditee = await auditee_kegiatan_lain.findAll({
      include: {
        model: kegiatan_lain,
        where: {
          pat_id,
          id,
        },
      },
      where: {
        tipe_uker: e.kode,
      },
      transaction: t,
    });

    const data = {
      kode: e.kode,
      name: e.name,
      target: findAuditee?.length || 0,
      existing: e.jumlah_existing,
    };
    return data;
  } catch (e) {
    
    throw new Error();
  }
};
const ukerExisttingAIKP = async (pat_id, uka) => {
  try {
    const data = await sequelize.query(queries.allUkerByUka, {
      bind: [uka],
      type: QueryTypes.SELECT,
    });

    const result = await Promise.all(
      data.map(async (e) => await ukerTargetAudit(pat_id, e))
    );

    return result;
  } catch (e) {
    ;
    throw new Error();
  }
};
const ukerExisttingAIKPJadwalAudit = async (pat_id, uka, id, t) => {
  try {
    const data = await sequelize.query(queries.allUkerByUka, {
      bind: [uka],
      type: QueryTypes.SELECT,
    });

    const result = await Promise.all(
      data.map(async (e) => await ukerTargetAuditJadwal(pat_id, e, id, t))
    );

    return result;
  } catch (e) {
    ;
    throw new Error();
  }
};
const ukerExistingAIKPSBP = async (pat_id, uka, id, t) => {
  try {
    const data = await sequelize.query(queries.allUkerByUka, {
      bind: [uka],
      type: QueryTypes.SELECT,
    });

    const result = await Promise.all(
      data.map(async (e) => await ukerTargetSbp(pat_id, e, id, t))
    );

    return result;
  } catch (e) {
    ;
    throw new Error();
  }
};
const ukerExisttingAIKPLainnya = async (pat_id, uka, id, t) => {
  try {
    const data = await sequelize.query(queries.allUkerByUka, {
      bind: [uka],
      type: QueryTypes.SELECT,
    });

    const result = await Promise.all(
      data.map(async (e) => await ukerTargetLain(pat_id, e, id, t))
    );

    return result;
  } catch (e) {
    ;
    throw new Error();
  }
};
const docUkerAuditAIKP = async (pat_id) => {
  try {
    const client = await pool.connect();
    const reg = ` AND j.ref_mtd_stc_audit_type_kode->>'audit_kode' = 'REG'`;
    const divisiReg = await sequelize.query(queries.targetAIKP.divisi + reg, [
      pat_id,
    ]);
    const deskReg = await sequelize.query(queries.targetAIKP.desk + reg, [
      pat_id,
    ]);
    const kcpReg = await sequelize.query(queries.targetAIKP.kcp + reg, [
      pat_id,
    ]);
    const kkReg = await sequelize.query(queries.targetAIKP.kk + reg, [pat_id]);
    const unitReg = await sequelize.query(queries.targetAIKP.unit + reg, [
      pat_id,
    ]);

    const tema = await sequelize.query(queries.targetAIW.tema, [pat_id]);
    const scheme = {
      "$group[jadwal_audit](jadwal_audit_id)": {
        id: "jadwal_audit_id",
        tema_audit: "tema_audit",
        "$group[uker](uker_id)": {
          uker_name: "brdesc",
        },
      },
    };
    const output = shape.parse(tema.rows, scheme);

    const SA = ` AND j.ref_mtd_stc_audit_type_kode->>'audit_kode' = 'SA'`;
    const divisiSA = await sequelize.query(queries.targetAIKP.divisi + SA, [
      pat_id,
    ]);
    const deskSA = await sequelize.query(queries.targetAIKP.desk + SA, [
      pat_id,
    ]);
    const kcpSA = await sequelize.query(queries.targetAIKP.kcp + SA, [pat_id]);
    const kkSA = await sequelize.query(queries.targetAIKP.kk + SA, [pat_id]);
    const unitSA = await sequelize.query(queries.targetAIKP.unit + SA, [
      pat_id,
    ]);
    client.release();
    const data = {
      reguler: {
        aikp: "0",
        divisi: divisiReg.rows[0].count,
        desk: deskReg.rows[0].count,
        pa: "0",
        kck: "0",
        kcp: kcpReg.rows[0].count,
        kk: kkReg.rows[0].count,
        unit: unitReg.rows[0].count,
      },
      tematik: output.jadwal_audit,
      special: {
        aikp: "0",
        divisi: divisiSA.rows[0].count,
        desk: deskSA.rows[0].count,
        pa: "0",
        kck: "0",
        kcp: kcpSA.rows[0].count,
        kk: kkSA.rows[0].count,
        unit: unitSA.rows[0].count,
      },
    };

    return data;
  } catch (e) {
    throw new Error();
  }
};
const showEchannel = async (pat_id) => {
  try {
    const allEchannel = await sequelize.query(queries.allEchannel, {
      type: QueryTypes.SELECT,
    });
    // return allEchannel;
    const result = await Promise.all(
      allEchannel.map(async (e) => await eChannelTargetAudit(pat_id, e))
    );

    return result;
  } catch (e) {
    ;
    throw new Error();
  }
};
const targetAuditForDoc = async (pat_id) => {
  try {
    let data;
    const p = await findPATbyId(pat_id);
    const uker = await ukerExisttingAIKP(pat_id, p.uka_kode);
    data = {
      target_audit: uker,
      echannel: await showEchannel(pat_id),
    };

    return data;
  } catch (e) {
    throw new Error();
  }
};
const showTargetAudit = async (req, res) => {
  try {
    const { pat_id } = req.query;
    const { uka_kode } = req.user;
    const p = await findPATbyId(pat_id);

    const [data, masterMetode, groupedJadwalAudit, echannel] = await Promise.all([
      ukerExisttingAIKP(pat_id, p.uka_kode),
      mtd_metode.findAll({
        attributes: ["kode", "nama"],
        where: {
          mtd_dimensi_kode: "1"
        },
        include: [
          {
            model: mtd_tipe,
            as: "mtd_tipe",
            attributes: ["kode", "nama"],
            include: [
              {
                model: mtd_jenis,
                as: "mtd_jenis",
                attributes: ["kode", "nama"],
                include: [
                  {
                    model: mtd_tema,
                    as: "mtd_tema",
                    attributes: ["kode", "nama"],
                  }
                ]
              }
            ]
          }
        ]
      }),
      jadwal_audit.findAll({
        attributes: ["ref_metode", "ref_tipe", "ref_jenis", "ref_tema"],
      }),
      showEchannel(pat_id)
    ]);

    function hitungJumlahJadwal(data, tipeKode, type) {
      return data.filter(item => item[type].kode === tipeKode).length;
    }

    // Menyiapkan struktur data target audit
    const masterMetodeArray = masterMetode.map((metode) => ({
      kode: metode.kode,
      nama: metode.nama,
      jumlah_jadwal: hitungJumlahJadwal(groupedJadwalAudit, metode.kode, "ref_metode"),
      children: metode.mtd_tipe.map((tipe) => ({
        kode: tipe.kode,
        nama: tipe.nama,
        jumlah_jadwal: hitungJumlahJadwal(groupedJadwalAudit, tipe.kode, "ref_tipe"),
        children: tipe.mtd_jenis.map((jenis) => ({
          kode: jenis.kode,
          nama: jenis.nama,
          jumlah_jadwal: hitungJumlahJadwal(groupedJadwalAudit, jenis.kode, "ref_jenis"),
          children: jenis.mtd_tema.map((tema) => ({
            kode: tema.kode,
            nama: tema.nama,
            jumlah_jadwal: hitungJumlahJadwal(groupedJadwalAudit, tema.kode, "ref_tema"),
          })),
        })),
      })),
    }));

    // Menyiapkan hasil akhir
    const result = {
      target_audit: data,
      echannel,
      jadwal_list: masterMetodeArray,
    };

    return sendResponse(res, 200, {
      status: "success", statusCode: 200, data: result
    })
  } catch (e) {
    return sendResponse(res, 500,{
      status: "failed",
      statusCode: 500,
      message: "Internal Server Error !",
      error: e,
    });
  }
};
const targetAIKPCount = async (branch, orgeh) => {
  try {
    const divisi = await sequelize.query(queries.targetAIKPForJadwal.divisi, {
      bind: [orgeh],
      type: QueryTypes.SELECT,
    });
    const desk = await sequelize.query(queries.targetAIKPForJadwal.desk, {
      bind: [orgeh],
      type: QueryTypes.SELECT,
    });
    const kcp = await sequelize.query(queries.targetAIKPForJadwal.kcp, {
      bind: [branch],
      type: QueryTypes.SELECT,
    });
    const kk = await sequelize.query(queries.targetAIKPForJadwal.kk, {
      bind: [branch],
      type: QueryTypes.SELECT,
    });
    const unit = await sequelize.query(queries.targetAIKPForJadwal.unit, {
      bind: [branch],
      type: QueryTypes.SELECT,
    });
    const data = {
      aikp: "0",
      divisi: divisi[0].count,
      desk: desk[0].count,
      pa: "0",
      ukln: "0",
      kck: "0",
      kcp: kcp[0].count,
      kk: kk[0].count,
      unit: unit[0].count,
    };
    return data;
  } catch (e) {
    throw new Error();
  }
};
const showTargetForJadwalAudit = async (pat_id, uka, id, t) => {
  try {
    let data = await ukerExisttingAIKPJadwalAudit(pat_id, uka, id, t);
    // let data = {
    //   existing: await ,
    //   target: await targetAIKPCount(branch, orgeh),
    // };

    return data;
  } catch (e) {
    throw new Error();
  }
};
const showTargetForJadwalSBP = async (pat_id, uka, id, t) => {
  try {
    let data = await ukerExistingAIKPSBP(pat_id, uka, id, t);
    // let data = {
    //   existing: await ,
    //   target: await targetAIKPCount(branch, orgeh),
    // };

    return data;
  } catch (e) {
    throw new Error();
  }
};
const showTargetForJadwalLainnya = async (pat_id, uka, id, t) => {
  try {
    let data = await ukerExisttingAIKPLainnya(pat_id, uka, id, t);

    return data;
  } catch (e) {
    throw new Error();
  }
};

module.exports = {
  targetAIKPCount,
  showTargetAudit,
  showTargetForJadwalAudit,
  showTargetForJadwalSBP,
  showTargetForJadwalLainnya,
  targetAuditForDoc,
  ukerExisttingAIKP,
  queries,
};
