const { findComment } = require("./commentController");
// const shape = require("shape-json");
const { targetAuditForDoc } = require("./targetAuditController");
const axios = require("axios");
// const { pool } = require("../services/connection");
const { findPATbyId } = require("../utils/PAT");
const {
  document_pat,
  target_audit,
  tim_audit,
  auditee_jadwal_sbp,
  ref_penanggung_jawab,
  ref_penanggung_jawab_kegiatan_lain,
  ref_kategori_anggaran,
  ref_tim_audit_ata,
  ref_tim_audit_kta,
  ref_tim_audit_ma,
  ref_ata_uker,
  ref_sub_kategori_anggaran,
  kegiatan_lain,
  auditee_kegiatan_lain,
  anggaran_kegiatan_lain,
  anggaran_kegiatan_jadwal_audit,
  anggaran_kegiatan_sbp,
  auditee_jadwal_audit,
  jadwal_sbp,
  jadwal_audit,
  sequelize,
} = require("../models");
const Sequelize = require("sequelize");
const { internalServerError, sendResponse } = require("../utils/errorReturn");
const { QueryTypes } = require("sequelize");
const queries = {
  timAuditALL: `
  SELECT t.id as tim_id ,pat_id,t.name as tim_name,a.id as id_ata,pn_ata,nama_ata,u.id as id_uker,branch,orgeh,my_name as orgeh_name,
  t.pn_ma,t.pn_kta,jabatan,pic_maker_tim_audit
  FROM pat.tim_audit as t
  LEFT JOIN pat.ref_tim_audit_ata a ON a.tim_audit_id = t.id
  LEFT JOIN pat.ref_ata_uker u ON u.ref_tim_audit_ata_id = a.id
  LEFT JOIN reference.mst_orgeh as m ON m.child = u.orgeh
  WHERE pat_id=$1  
  `,
  allJadwalForUker: `
  SELECT j.id as jadwal_audit_id ,name_kegiatan_audit, t.id as tim_audit_id,ref_mtd_stc_audit_type_kode,name_kegiatan_audit,count_target_jenis_auditee,
  CAST(pelaksanaan_start as VARCHAR), CAST(pelaksanaan_end as VARCHAR) ,pic_jadwal_audit,t.name as tim_audit_name,pat_id,uka,total_anggaran,
  t.pn_kta,t.pn_ma,ta.id,ta.pn_ata as pn_ata, ta.nama_ata as nama_ata , ta.jabatan as jabatan_at,my_name as nama_orgeh
  FROM pat.jadwal_audit as j
  LEFT JOIN pat.auditee_jadwal_audit as aj ON aj.jadwal_audit_id = j.id
  LEFT JOIN reference.mst_orgeh as m ON m.child = (case when j.orgeh_induk is not null then j.orgeh_induk else aj.ref_auditee_orgeh end)
  LEFT JOIN pat.tim_audit as t ON t.id = j.tim_audit_id
  LEFT JOIN pat.ref_tim_audit_ata as ta ON ta.tim_audit_id = t.id
  LEFT JOIN pat.pat as p ON p.id = t.pat_id
  WHERE p.id = $1
  `,

  allJadwalForObjek: `
  SELECT j.id as jadwal_audit_id ,name_kegiatan_audit, t.id as tim_audit_id,ref_mtd_stc_audit_type_kode,name_kegiatan_audit,count_target_jenis_auditee,
  CAST(pelaksanaan_start as VARCHAR), CAST(pelaksanaan_end as VARCHAR) ,pic_jadwal_audit,t.name as tim_audit_name,pat_id,uka,total_anggaran,
  t.pn_kta,t.pn_ma,ta.id,ta.pn_ata as pn_ata, ta.nama_ata as nama_ata , ta.jabatan as jabatan_at,objek,tipe_objek
  FROM pat.jadwal_audit as j
  LEFT JOIN pat.aiti_objek_audit as aj ON aj.jadwal_audit_id = j.id
  LEFT JOIN pat.tim_audit as t ON t.id = j.tim_audit_id
  LEFT JOIN pat.ref_tim_audit_ata as ta ON ta.tim_audit_id = t.id
  LEFT JOIN pat.pat as p ON p.id = t.pat_id
  WHERE p.id = $1
  `,
  all_sbp: `
  SELECT s.id as jadwal_sbp_id,branch_induk , orgeh_induk , m.my_name as orgeh_name,
  p.id as id_pembicara,p.pn as pn_pembicara ,p.nama as nama_pembicara,p.jabatan as jabatan_pembicara, pj.id as id_penanggung_jawab ,total_anggaran,
  pj.pn as pn_penanggung_jawab , pj.nama as nama_penanggung_jawab ,pj.jabatan as jabatan_penanggung_jawab,sbp.name as sbp_name,pic_maker_jadwal_sbp,
  sbp.name as sbp_name,CAST(pelaksanaan_start as VARCHAR),CAST(pelaksanaan_end as VARCHAR),pic_maker_jadwal_sbp
  FROM pat.jadwal_sbp s
  LEFT JOIN pat.ref_penanggung_jawab as pj ON pj.jadwal_sbp_id = s.id
  LEFT JOIN pat.ref_pembicara p ON p.jadwal_sbp_id = s.id
  WHERE pat_id = $1
`,

  kegiatanLain: `
  select k.id as id_kegiatan , k.nama as nama_kegiatan,pat_id,pic_maker_kegiatan_lain,total_anggaran,
  CAST(pelaksanaan_start as VARCHAR),CAST(pelaksanaan_end as VARCHAR),orgeh_induk,branch_induk,
  m.my_name as orgeh_name,a.id as id_anggota ,pn_anggota,nama_anggota,jabatan
  FROM pat.kegiatan_lain as k
  LEFT JOIN reference.mst_orgeh as m ON m.child = k.orgeh_induk
  LEFT JOIN pat.anggota_kegiatan_lain as a ON a.kegiatan_lain_id = k.id
  WHERE pat_id = $1
  `,
  countTarget: `
  SELECT pat_id, count_target_jenis_auditee
  FROM pat.jadwal_audit as j
  LEFT JOIN pat.tim_audit ta on j.tim_audit_id = ta.id
  WHERE j.id = $1
  `,
  anggaranDinas: `
  SELECT SUM(COALESCE(CAST(biaya_perjalanan_hari as BIGINT),0) + COALESCE(CAST(biaya_tiket_pp AS BIGINT),0)+COALESCE(CAST(biaya_akomodasi AS BIGINT),0)+
  COALESCE(CAST(biaya_transport_lokal AS BIGINT),0)) as total_biaya_dinas
  FROM (
    SELECT biaya_perjalanan_hari,biaya_tiket_pp , biaya_akomodasi,biaya_transport_lokal
    FROM pat.anggaran_perjalanan_dinas_sbp as ad 
    LEFT JOIN pat.jadwal_sbp as s ON s.id = ad.jadwal_sbp_id
    WHERE s.pat_id = $1
    UNION ALL
    select biaya_perjalanan_hari,biaya_tiket_pp , biaya_akomodasi,biaya_transport_lokal
    FROM pat.anggaran_perjalanan_dinas_lain as kad
    LEFT JOIN pat.kegiatan_lain as k ON k.id = kad.kegiatan_lain_id
    WHERE k.pat_id = $1
    UNION ALL 
    SELECT biaya_perjalanan_hari,biaya_tiket_pp , biaya_akomodasi,biaya_transport_lokal
    FROM pat.anggaran_perjalanan_dinas_jadwal_audit as aad
    LEFT JOIN pat.jadwal_audit as j ON j.id = aad.jadwal_audit_id
    LEFT JOIN pat.tim_audit as t ON t.id = j.tim_audit_id
    WHERE j.pat_id = $1
  ) as nested
  `,

  anggaranKegiatan: `
  SELECT r.id as sub_kategori_id,SUM(amount)
    FROM pat.ref_sub_kategori_anggaran as r
    LEFT JOIN pat.anggaran_kegiatan_sbp as ak ON CAST(ak.ref_sub_kategori_anggaran_kode ->> 'ref_sub_kategori_anggaran_kode' as INTEGER) = r.id
    LEFT JOIN pat.jadwal_sbp as k ON k.id = ak.jadwal_sbp_id
    WHERE k.pat_id = $1
    GROUP BY 
      r.id
  UNION ALL
  SELECT r.id as sub_kategori_id,SUM(amount)
    FROM pat.ref_sub_kategori_anggaran as r
    LEFT JOIN pat.anggaran_kegiatan_lain as ak ON CAST(ak.ref_sub_kategori_anggaran_kode ->> 'ref_sub_kategori_anggaran_kode' as INTEGER) = r.id
    LEFT JOIN pat.kegiatan_lain as k ON k.id = ak.kegiatan_lain_id
    WHERE k.pat_id = $1
    GROUP BY 
    r.id
  UNION ALL
  SELECT r.id as sub_kategori_id,SUM(amount)
    FROM pat.ref_sub_kategori_anggaran as r
    LEFT JOIN pat.anggaran_kegiatan_jadwal_audit as ak ON CAST(ak.ref_sub_kategori_anggaran_kode ->> 'ref_sub_kategori_anggaran_kode' as INTEGER) = r.id
    LEFT JOIN pat.jadwal_audit as k ON k.id = ak.jadwal_audit_id
    LEFT JOIN pat.tim_audit as t ON t.id = k.tim_audit_id
    WHERE k.pat_id = $1
    GROUP BY 
    r.id
  `,
  kategori: `
  SELECT r.id as kategori_id , r.nama as kategori_name ,rs.id as sub_kategori_id, rs.nama as sub_kategori_name
  FROM pat.ref_kategori_anggaran as r
  LEFT JOIN pat.ref_sub_kategori_anggaran as rs ON rs.ref_kategori_anggaran_id = r.id
  `,
  allSBPKegiatan: `
  SELECT r.id as kategori_id , r.nama as kategori_name ,rs.id as sub_kategori_id, rs.nama as sub_kategori_name ,ak.id as anggaran_id, amount, k.id as id
  FROM pat.ref_kategori_anggaran as r
  LEFT JOIN pat.ref_sub_kategori_anggaran as rs ON rs.ref_kategori_anggaran_id = r.id
  LEFT JOIN pat.anggaran_kegiatan_sbp as ak ON CAST(ak.ref_sub_kategori_anggaran_kode ->> 'ref_sub_kategori_anggaran_kode' as INTEGER) = rs.id
  LEFT JOIN pat.jadwal_sbp as k ON k.id = ak.jadwal_sbp_id
  WHERE k.pat_id = $1
  `,
  allLainKegiatan: `
  SELECT r.id as kategori_id , r.nama as kategori_name ,rs.id as sub_kategori_id, rs.nama as sub_kategori_name ,ak.id as anggaran_id, amount, k.id as id
  FROM pat.ref_kategori_anggaran as r
  LEFT JOIN pat.ref_sub_kategori_anggaran as rs ON rs.ref_kategori_anggaran_id = r.id
  LEFT JOIN pat.anggaran_kegiatan_lain as ak ON CAST(ak.ref_sub_kategori_anggaran_kode ->> 'ref_sub_kategori_anggaran_kode' as INTEGER) = rs.id
  LEFT JOIN pat.kegiatan_lain as k ON k.id = ak.kegiatan_lain_id
  WHERE k.pat_id = $1
  `,
  allAuditKegiatan: `
  SELECT r.id as kategori_id , r.nama as kategori_name ,rs.id as sub_kategori_id, rs.nama as sub_kategori_name ,ak.id as anggaran_id, amount, k.id as id
  FROM pat.ref_kategori_anggaran as r
  LEFT JOIN pat.ref_sub_kategori_anggaran as rs ON rs.ref_kategori_anggaran_id = r.id
  LEFT JOIN pat.anggaran_kegiatan_jadwal_audit as ak ON CAST(ak.ref_sub_kategori_anggaran_kode ->> 'ref_sub_kategori_anggaran_kode' as INTEGER) = rs.id
  LEFT JOIN pat.jadwal_audit as k ON k.id = ak.jadwal_audit_id
  LEFT JOIN pat.tim_audit as t ON t.id = k.tim_audit_id
  WHERE k.pat_id = $1
  `,
  Audit: `
  SELECT DISTINCT j.id, EXTRACT(MONTH FROM j.pelaksanaan_start) as bulan , name_kegiatan_audit 
  FROM pat.jadwal_audit as j
  LEFT JOIN pat.tim_audit as t ON t.id = j.tim_audit_id
  WHERE j.pat_id = $1
  `,
  AuditJabatan: `
  SELECT CAST(pn_auditor->>'jabatan' AS VARCHAR) AS jabatan,
  lama_kegiatan,biaya_perjalanan_hari , biaya_tiket_pp,biaya_transport_lokal,biaya_akomodasi
  FROM pat.anggaran_perjalanan_dinas_jadwal_audit as ad
  WHERE jadwal_audit_id =$1
   `,
  OrgehName: `
  SELECT ref_auditee_orgeh_kode, ref_auditee_orgeh_name
  FROM pat.auditee_jadwal_audit
  WHERE jadwal_audit_id = $1
  `,
  SBP: `
  SELECT DISTINCT j.id, EXTRACT(MONTH FROM j.pelaksanaan_start) as bulan,j.nama
  FROM pat.jadwal_sbp as j
  WHERE j.pat_id = $1
  `,
  SBPJabatan: `
  SELECT CAST(pn_auditor->>'jabatan' AS VARCHAR) AS jabatan,
  lama_kegiatan,biaya_perjalanan_hari , biaya_tiket_pp,biaya_transport_lokal,biaya_akomodasi
  FROM pat.anggaran_perjalanan_dinas_sbp as ad
  WHERE jadwal_sbp_id =$1
   `,
  KegiatanLain: `
  SELECT DISTINCT j.id, EXTRACT(MONTH FROM j.pelaksanaan_start) as bulan,nama
  FROM pat.kegiatan_lain as j
  WHERE pat_id = $1
   `,
  KegiatanLainJabatan: `
  SELECT CAST(pn_auditor->>'jabatan' AS VARCHAR) AS jabatan,
  lama_kegiatan,biaya_perjalanan_hari , biaya_tiket_pp,biaya_transport_lokal,biaya_akomodasi
  FROM pat.anggaran_perjalanan_dinas_lain as ad
  WHERE kegiatan_lain_id =$1
    `,
};
const getJabatanAudit = async (e, uka) => {
  try {
    let orgeh;
    const jabatan = await sequelize.query(queries.AuditJabatan, {
      bind: [e.id],
      type: QueryTypes.SELECT,
    });
    orgeh = await sequelize.query(queries.OrgehName, {
      bind: [e.id],
      type: QueryTypes.SELECT,
    });

    let obj = {};
    jabatan.forEach(async (c) => {
      if (obj[c.jabatan]) {
        obj[c.jabatan].jumlah = obj[c.jabatan].jumlah + 1;
      } else if (!obj[c.jabatan]) {
        obj[c.jabatan] = {
          jumlah: 1,
          lama_kegiatan: c.lama_kegiatan,
          biaya_akomodasi: c.biaya_akomodasi,
          biaya_tiket: c.biaya_tiket_pp,
          biaya_transport: c.biaya_transport_lokal,
          biaya_perjalanan: c.biaya_perjalanan_hari,
          total_biaya:
            Number(c.biaya_akomodasi) +
            Number(c.biaya_tiket_pp) +
            Number(c.biaya_transport_lokal) +
            Number(c.biaya_perjalanan_hari),
        };
      }
    });
    for (let i in obj) {
      const n = Number(obj[i].jumlah);
      obj[i].biaya_akomodasi = Number(obj[i].biaya_akomodasi) * n;
      obj[i].biaya_tiket = Number(obj[i].biaya_tiket) * n;
      obj[i].biaya_transport = Number(obj[i].biaya_transport) * n;
      obj[i].biaya_perjalanan = Number(obj[i].biaya_perjalanan) * n;
      obj[i].total_biaya = Number(obj[i].total_biaya) * n;
    }
    return {
      tempat_kegiatan: orgeh,
      nama_kegiatan: e.name_kegiatan_audit,
      bulan: e.bulan,
      Jabatan: obj,
    };
  } catch (e) {
    
    throw new Error();
  }
};
const getJabatanSBP = async (e) => {
  try {
    const jabatan = await sequelize.query(queries.SBPJabatan, {
      bind: [e.id],
      type: QueryTypes.SELECT,
    });
    let obj = {};
    jabatan.forEach(async (c) => {
      if (obj[c.jabatan]) {
        obj[c.jabatan].jumlah = obj[c.jabatan].jumlah + 1;
      } else if (!obj[c.jabatan]) {
        obj[c.jabatan] = {
          jumlah: 1,
          lama_kegiatan: c.lama_kegiatan,
          biaya_akomodasi: c.biaya_akomodasi,
          biaya_tiket: c.biaya_tiket_pp,
          biaya_transport: c.biaya_transport_lokal,
          biaya_perjalanan: c.biaya_perjalanan_hari,
          total_biaya:
            Number(c.biaya_akomodasi) +
            Number(c.biaya_tiket_pp) +
            Number(c.biaya_transport_lokal) +
            Number(c.biaya_perjalanan_hari),
        };
      }
    });
    for (let i in obj) {
      const n = obj[i].jumlah;
      obj[i].biaya_akomodasi = Number(obj[i].biaya_akomodasi) * n;
      obj[i].biaya_tiket = Number(obj[i].biaya_tiket) * n;
      obj[i].biaya_transport = Number(obj[i].biaya_transport) * n;
      obj[i].biaya_perjalanan = Number(obj[i].biaya_perjalanan) * n;
      obj[i].total_biaya = Number(obj[i].total_biaya) * n;
    }
    return {
      tempat_kegiatan: e.orgeh_name,
      nama_kegiatan: e.name,
      bulan: e.bulan,
      Jabatan: obj,
    };
  } catch (e) {
    throw new Error();
  }
};
const getJabatanLain = async (e) => {
  try {
    const jabatan = await sequelize.query(queries.KegiatanLainJabatan, {
      bind: [e.id],
      type: QueryTypes.SELECT,
    });
    let obj = {};
    jabatan.forEach(async (c) => {
      if (obj[c.jabatan]) {
        obj[c.jabatan].jumlah = obj[c.jabatan].jumlah + 1;
      } else if (!obj[c.jabatan]) {
        obj[c.jabatan] = {
          jumlah: 1,
          lama_kegiatan: Number(c.lama_kegiatan),
          biaya_akomodasi: Number(c.biaya_akomodasi),
          biaya_tiket: Number(c.biaya_tiket_pp),
          biaya_transport: Number(c.biaya_transport_lokal),
          biaya_perjalanan: Number(c.biaya_perjalanan_hari),
          total_biaya:
            Number(c.biaya_akomodasi) +
            Number(c.biaya_tiket_pp) +
            Number(c.biaya_transport_lokal) +
            Number(c.biaya_perjalanan_hari),
        };
      }
    });
    for (let i in obj) {
      const n = obj[i].jumlah;
      obj[i].biaya_akomodasi = Number(obj[i].biaya_akomodasi) * n;
      obj[i].biaya_tiket = Number(obj[i].biaya_tiket) * n;
      obj[i].biaya_transport = Number(obj[i].biaya_transport) * n;
      obj[i].biaya_perjalanan = Number(obj[i].biaya_perjalanan) * n;
      obj[i].total_biaya = Number(obj[i].total_biaya) * n;
    }
    return {
      tempat_kegiatan: e.orgeh_name,
      nama_kegiatan: e.nama,
      bulan: e.bulan,
      Jabatan: obj,
    };
  } catch (e) {
    throw new Error();
  }
};

const showLatarBelakangTujuan = async (req, res) => {
  try {
    const { pat_id } = req.query;
    const { pn } = req.user;
    const data = await findPATbyId(pat_id);
    if (!data) {
      return sendResponse(res, 404, {
        status: "failed",
        statusCode: 404,
        message: "PAT tidak ditemukan !",
      });
    }
    const com = await findComment(pat_id, 1);
    return sendResponse(res, 200, {
      status: "success",
      statusCode: 200,
      data: data.latar_belakang,
      comments: com,
    })
  } catch (e) {
    
    return internalServerError(res, e);
  }
};
const showSumberInformasi = async (req, res) => {
  try {
    const { pat_id } = req.query;

    const data = await findPATbyId(pat_id);
    if (!data) {
      return sendResponse(res, 404, {
        status: "failed",
        statusCode: 404,
        message: "PAT tidak ditemukan !",
      });
    }
    const com = await findComment(pat_id, 2);
    return sendResponse(res, 200, {
      status: "success",
      statusCode: 200,
      data: data.sumber_informasi,
      comments: com,
    })
  } catch (e) {
    
    return internalServerError(res, e);
  }
};
const showTargetAudit = async (req, res) => {
  try {
    const { ref_metode_kode, pat_id } = req.query;
    const allJadwalAudit = await jadwal_audit.findAll({
      where: {
        "ref_metode.kode": ref_metode_kode,
      },
      include: [
        {
          model: auditee_jadwal_audit,
        },
        {
          model: tim_audit,
          where: {
            pat_id,
          },
        },
      ],
    });

    // Grouping the data based on ref_tipe and ref_jenis
    const groupedData = {};
    allJadwalAudit.forEach((jadwal) => {
      if (!groupedData[jadwal.ref_tipe.nama]) {
        groupedData[jadwal.ref_tipe.nama] = {};
      }

      if (!groupedData[jadwal.ref_tipe.nama][jadwal.ref_jenis.nama]) {
        groupedData[jadwal.ref_tipe?.nama][jadwal.ref_jenis?.nama] = [];
      }
      groupedData[jadwal.ref_tipe.nama][jadwal.ref_jenis.nama].push(jadwal);
    });

    const com = await findComment(pat_id, 3);
    return sendResponse(res, 200, {
      status: "success",
      statusCode: 200,
      data: groupedData,
      comments: com,
    })

  } catch (error) {
    console.error("Error fetching data:", error);
    sendResponse(res, 500,{ error: "Failed to fetch data" });
  }
};
const showTimAudit = async (req, res) => {
  try {
    const { pat_id } = req.query;
    const { pn } = req.user;
    const tim = await tim_audit.findAll({
      include: [
        {
          model: ref_tim_audit_ata,
          include: [
            {
              model: ref_ata_uker,
            },
          ],
          attributes: {
            exclude: ["create_by", "update_by", "createdAt", "updatedAt"],
          },
        },
        {
          model: ref_tim_audit_kta,
          attributes: {
            exclude: ["create_by", "update_by", "createdAt", "updatedAt"],
          },
        },
        {
          model: ref_tim_audit_ma,
          attributes: {
            exclude: ["create_by", "update_by", "createdAt", "updatedAt"],
          },
        },
      ],
      where: { pat_id },
      attributes: {
        exclude: ["create_by", "update_by", "createdAt", "updatedAt"],
      },
    });
    const com = await findComment(pat_id, 4);
    return sendResponse(res, 200, {
      status: "success",
      statusCode: 200,
      data: tim,
      comments: com,
    })

  } catch (e) {
    return internalServerError(res, e);
  }
};
const showJadwalAudit = async (req, res) => {
  try {
    const { pat_id } = req.query;
    const { pn } = req.user;
    const p = await findPATbyId(pat_id);
    let jadwal;

    jadwal = await jadwal_audit.findAll({
      where: {
        pat_id,
      },
      include: [
        {
          model: auditee_jadwal_audit,
          seperate: true,
        },
        {
          model: tim_audit,
          where: {
            pat_id,
          },
          include: [
            {
              model: ref_tim_audit_ata,
              include: [
                {
                  model: ref_ata_uker,
                },
              ],
            },
            {
              model: ref_tim_audit_ma,
              seperate: true,
            },
            {
              model: ref_tim_audit_kta,
              seperate: true,
            },
          ],
          seperate: true,
        },
      ],
    });

    const com = await findComment(pat_id, 5);
    return sendResponse(res, 200, {
      status: "success",
      statusCode: 200,
      data: jadwal,
      comments: com,
    })
  } catch (e) {
    
    return internalServerError(res, e);
  }
};
const showJadwalSBP = async (req, res) => {
  try {
    const { pat_id } = req.query;
    const { pn } = req.user;
    const jadwalSBP = await jadwal_sbp.findAll({
      where: { pat_id },
      include: [
        {
          model: ref_penanggung_jawab,
          seperate: true,
        },
        {
          model: auditee_jadwal_sbp,
          seperate: true,
        },
      ],
    });

    const com = await findComment(pat_id, 6);
    return sendResponse(res, 200, {
      status: "success",
      statusCode: 200,
      data: jadwalSBP,
      comments: com,
    })
  } catch (e) {
    
    return internalServerError(res, e);
  }
};
const showKegiatanLain = async (req, res) => {
  try {
    const { pat_id } = req.query;
    const { pn } = req.user;
    const lain = await kegiatan_lain.findAll({
      where: { pat_id },
      include: [
        {
          model: ref_penanggung_jawab_kegiatan_lain,
          seperate: true,
        },
        {
          model: auditee_kegiatan_lain,
          seperate: true,
        },
      ],
    });

    const com = await findComment(pat_id, 7);
    return sendResponse(res, 200, {
      status: "success",
      statusCode: 200,
      data: lain,
      comments: com,
    })

  } catch (e) {
    return internalServerError(res, e);
  }
};
const showAnggaran = async (req, res) => {
  try {
    const { pat_id } = req.query;
    const p = await findPATbyId(pat_id);
    let obj = {};
    const [allAnggaranDinas, kategoriAnggaran, allAnggaranK] =
      await Promise.all([
        sequelize.query(queries.anggaranDinas, {
          bind: [pat_id],
          type: QueryTypes.SELECT,
        }),
        sequelize.query(queries.kategori, {
          type: QueryTypes.SELECT,
        }),
        sequelize.query(queries.anggaranKegiatan, {
          bind: [pat_id],
          type: QueryTypes.SELECT,
        }),
      ]);
    allAnggaranK.forEach((e) => {
      if (obj[e.sub_kategori_id])
        obj[e.sub_kategori_id] = obj[e.sub_kategori_id] + Number(e.sum) || 0;
      else obj[e.sub_kategori_id] = Number(e.sum);
    });
    const result = kategoriAnggaran;
    let n = 1;
    result.forEach((e) => {
      e["sum"] = obj[`${n}`];
      n++;
    });
    const [
      sbpKegiatan,
      lainKegiatan,
      auditKegiatan,
      auditDinas,
      SBPDinas,
      LainDinas,
    ] = await Promise.all([
      sequelize.query(queries.allSBPKegiatan, {
        bind: [pat_id],
        type: QueryTypes.SELECT,
      }),
      sequelize.query(queries.allLainKegiatan, {
        bind: [pat_id],
        type: QueryTypes.SELECT,
      }),
      sequelize.query(queries.allAuditKegiatan, {
        bind: [pat_id],
        type: QueryTypes.SELECT,
      }),
      sequelize.query(queries.Audit, {
        bind: [pat_id],
        type: QueryTypes.SELECT,
      }),
      sequelize.query(queries.SBP, {
        bind: [pat_id],
        type: QueryTypes.SELECT,
      }),
      sequelize.query(queries.KegiatanLain, {
        bind: [pat_id],
        type: QueryTypes.SELECT,
      }),
    ]);
    const jadwalAuditResult = await Promise.all(
      auditDinas.map(async (e) => await getJabatanAudit(e, p.uka))
    );
    const SBPResult = await Promise.all(
      SBPDinas.map(async (e) => await getJabatanSBP(e))
    );
    const LainResult = await Promise.all(
      LainDinas.map(async (e) => await getJabatanLain(e))
    );

    const com = await findComment(pat_id, 8);
    const data = {
      tahun: p.tahun,
      totalAnggaran: {
        allAnggaranDinas: Number(allAnggaranDinas[0].total_biaya_dinas),
        allAnggaranKegiatan: result,
      },
      allAnggaranKegiatan: [
        sbpKegiatan.jadwal,
        lainKegiatan.jadwal,
        auditKegiatan.jadwal,
      ].flat(1),
      allAnggaranDinas: [jadwalAuditResult, LainResult, SBPResult].flat(1),
    };
    return sendResponse(res, 200, {
      status: "success",
      statusCode: 200,
      data,
      comments: com,
    })
  } catch (e) {
    
    return internalServerError(res, e);
  }
};
const generateDocument = async (html, modul) => {
  try {
    const hit = await axios
      .post(`${process.env.COMMON_SERVICE_HOST}/common/generate`, {
        docBody: html,
        docName: `PAT-DOC`,
        modul,
      })
      .catch(function (error) {
      });
    return hit.data.data.path;
  } catch (e) {
    return false;
  }
};

const findAllDocument = async (req, res) => {
  try {
    const { pat_id } = req.query;
    const doc = await document_pat.findAll({ where: { pat_id } });
    return sendResponse(res, 200, { status: "success", statusCode: 200, data: doc })
  } catch (e) {
    return internalServerError(res, e);
  }
};

module.exports = {
  showLatarBelakangTujuan,
  showSumberInformasi,
  showTargetAudit,
  showTimAudit,
  showJadwalAudit,
  showJadwalSBP,
  showKegiatanLain,
  showAnggaran,
  findAllDocument,
  generateDocument,
};
