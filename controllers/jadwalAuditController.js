const {
  jadwal_audit,
  tim_audit,
  anggaran_perjalanan_dinas_jadwal_audit,
  echannel_jadwal_audit,
  anggaran_kegiatan_jadwal_audit,
  aiti_objek_audit,
  ref_tim_audit_ma,
  ref_tim_audit_kta,
  ref_sub_kategori_anggaran,
  ref_tim_audit_ata,
  sequelize,
  auditee_jadwal_audit,
} = require("../models");
const { Transaction, QueryTypes, Op } = require("sequelize");
const { groupBy } = require("lodash");
const { findPATbyId } = require("../utils/PAT");
const { pool } = require("../services/connection");
const {
  showTargetForJadwalAudit,
  targetAITICount,
  ukerExistingAITI,
} = require("./targetAuditController");
const { sendResponse } = require("../utils/errorReturn");

const queries = {
  echannel: `
    SELECT kode,name
    FROM reference.echannel_type
    `,
  auditee: `
    SELECT j.id as auditee_id , jadwal_audit_id , ref_auditee_branch_kode as branch,ref_auditee_orgeh_kode as orgeh ,ref_auditee_orgeh_name as orgeh_name,
    deskripsi,attachments,ref_auditee_branch_name as branch_name,tipe_uker
    FROM pat.auditee_jadwal_audit as j
    WHERE jadwal_audit_id = $1
    `,
  allJadwal: `
    SELECT j.id as jadwal_audit_id ,name_kegiatan_audit, t.id as tim_audit_id,t.name , ref_mtd_stc_audit_type_kode,name_kegiatan_audit,count_target_jenis_auditee,
    CAST(pelaksanaan_start as VARCHAR), CAST(pelaksanaan_end as VARCHAR) ,pic_jadwal_audit,t.name as tim_audit_name,pat_id,uka,total_anggaran,
    t.pn_kta,t.pn_ma,ta.id,ta.pn_ata as pn_ata, ta.nama_ata as nama_ata , ta.jabatan as jabatan_ata
    FROM pat.jadwal_audit as j
    LEFT JOIN pat.tim_audit as t ON t.id = j.tim_audit_id
    LEFT JOIN pat.ref_tim_audit_ata as ta ON ta.tim_audit_id = t.id
    LEFT JOIN pat.pat as p ON p.id = t.pat_id
    WHERE j.id = $1
    `,
  filterJadwal: `
    SELECT DISTINCT j.id, name_kegiatan_audit
    FROM pat.jadwal_audit as j
    LEFT JOIN pat.tim_audit as t ON t.id = j.tim_audit_id
    LEFT JOIN pat.ref_tim_audit_ata as ta ON ta.tim_audit_id = t.id
    LEFT JOIN pat.pat as p ON p.id = t.pat_id
    WHERE p.id=$1 
    `,
  countTarget: `
    SELECT count_target_jenis_auditee
    FROM pat.jadwal_audit as j
    WHERE id = $1
    `,
  lama_kegiatan: `
    SELECT DATE_PART('day',pelaksanaan_end - pelaksanaan_start) as days
    FROM pat.jadwal_audit as j
    WHERE j.id = $1
    `,
  orgeh_name: `
    SELECT my_name as orgeh_name
    FROM reference.mst_orgeh
    WHERE child = $1
    `,
  branch_name: `
    SELECT brdesc 
    FROM reference.mst_dwh_branch
    WHERE branch = $1
    `,
};
const auditScheme = {
  "$group[jadwal_audit](jadwal_audit_id)": {
    id: "jadwal_audit_id",
    tipe_audit: "ref_mtd_stc_audit_type_kode.audit_type",
    tipe_audit_kode: "ref_mtd_stc_audit_type_kode.audit_kode",
    nama_kegiatan: "name_kegiatan_audit",
    pat_id: "pat_id",
    uka: "uka",
    tim_audit_name: "tim_audit_name",
    total_anggaran: "total_anggaran",
    pn_pic_jadwal_audit: "pic_jadwal_audit.pn",
    nama_pic_jadwal_audit: "pic_jadwal_audit.nama",
    jabatan_pic_jadwal_audit: "pic_jadwal_audit.jabatan",
    pelaksanaan_start: "pelaksanaan_start",
    pelaksanaan_end: "pelaksanaan_end",
    tim_id: "tim_audit_id",
    pn_ma: "pn_ma.pn",
    nama_ma: "pn_ma.nama",
    jabatan_ma: "pn_ma.jabatan",
    pn_kta: "pn_kta.pn",
    nama_kta: "pn_kta.nama",
    jabatan_kta: "pn_kta.jabatan",
    "$group[ata](id)": {
      id_ata: "id",
      pn_ata: "pn_ata",
      nama_ata: "nama_ata",
      jabatan: "jabatan_ata",
    },
  },
};
const getJadwal = async (e) => {
  try {
    const jadwal = await jadwal_audit.findOne({
      where: { id: e.id },
      include: {
        model: tim_audit,
      },
    });
    return jadwal;
  } catch (e) {
    throw new Error();
  }
};
const getCountTarget = async (e) => {
  try {
    const jadwal = await sequelize.query(queries.countTarget, {
      bind: [e.id],
      type: QueryTypes.SELECT,
    });
    const data = {
      jadwal_audit: e,
      targetAudit: jadwal[0],
    };
    return data;
  } catch (e) {
    throw new Error();
  }
};

const getDays = async (id) => {
  // try {
  const days = await sequelize.query(queries.lama_kegiatan, {
    bind: [id],
    type: QueryTypes.SELECT,
  });
  return Number(days[0]?.days);
  // } catch (e) {
  //   throw new Error();
  // }
};
const getJadwalAudit = async (pat_id) => {
  try {
    const r = await jadwal_audit.findOne({
      include: [
        {
          model: tim_audit,
          where: {
            pat_id,
          },
          attributes: [],
        },
      ],
      attributes: ["pic_jadwal_audit"],
    });

    return r;
  } catch (e) {
    throw new Error("tidak ditemukan !");
  }
};
const getJadwalDetails = async (id) => {
  try {
    const [jadwal, eChan, dinas, kegiatan, auditee] = await Promise.all([
      jadwal_audit.findOne({
        where: { id },
        attributes: {
          exclude: ["create_by", "update_by", "createdAt", "updatedAt"],
        },
      }),
      echannel_jadwal_audit.findAll({
        where: { jadwal_audit_id: id },
        attributes: {
          exclude: ["create_by", "update_by", "createdAt", "updatedAt"],
        },
      }),
      anggaran_perjalanan_dinas_jadwal_audit.findAll({
        where: { jadwal_audit_id: id },
        attributes: {
          exclude: ["create_by", "update_by", "createdAt", "updatedAt"],
        },
      }),
      anggaran_kegiatan_jadwal_audit.findAll({
        where: { jadwal_audit_id: id },
        attributes: {
          exclude: ["create_by", "update_by", "createdAt", "updatedAt"],
        },
      }),
      auditee_jadwal_audit.findAll({
        where: { jadwal_audit_id: id },
        attributes: {
          exclude: ["create_by", "update_by", "createdAt", "updatedAt"],
        },
      }),
    ]);

    if (!jadwal) {
      return null;
    }

    const data = {
      jadwal,
      anggaran_kegiatan: kegiatan,
      anggaran_dinas: dinas,
      echannel: eChan,
      auditee_jadwal_audit: auditee,
    };
    return data;
  } catch (e) {
    throw new Error();
  }
};
const showJadwalAuditByIdDetails = async (req, res) => {
  try {
    const { jadwal_id, pat_id } = req.query;
    const { uka_kode, pn } = req.user;
    // const p = await findPATbyId(pat_id);

    // if (p.uka_kode != uka_kode && uka_kode.match(/pska/gi) == null) {
    //   return sendResponse(res, 403, {
    //     status: "failed",
    //     statusCode: 403,
    //     message: "Forbidden !",
    //   });
    // }
    const data = await getJadwalDetails(jadwal_id);

    if (!data) {
      return sendResponse(res, 404, {
        status: "failed",
        statusCode: 404,
        message: "jadwal tidak ditemukan !",
      });
    }
    return sendResponse(res, 200, {
      status: "success",
      statusCode: 200,
      data,
    })
    
 
  } catch (e) {
    return sendResponse(res, 500,{
      status: "failed",
      statusCode: 500,
      message: "Internal server error ! ",
      error: e,
    });
  }
};
const showAllJadwalAudit = async (req, res) => {
  try {
    const {
      pat_id,
      page,
      project_name,
      ref_metode,
      ref_tipe,
      ref_jenis,
      ref_tema,
      timAudit,
      start,
      end,
      maker,
    } = req.query;
    let { limit } = req.query;
    let { sortBy } = req.query;

    limit = limit ? limit : 9;
    const { uka_kode } = req.user;
    let sort = "";
    let detailPage;
    const p = await findPATbyId(pat_id);
    // if (p.uka_kode != uka_kode && uka_kode.match(/pska/gi) == null) {
    //   return sendResponse(res, 403, {
    //     status: "failed",
    //     statusCode: 403,
    //     message: "Forbidden !",
    //   });
    // }

    const file = [
      pat_id,
      parseInt(limit, 10),
      (parseInt(page, 10) - 1) * parseInt(limit, 10),
    ];
    const countFile = [pat_id];
    let str = `
        LIMIT $2
        OFFSET $3
        `;
    let n = 4;
    let c = 2;
    let filterBy = "";
    let countFilter = "";
    if (sortBy) {
      sort = `
          ORDER BY ${sortBy}
          `;
    }
    if (project_name) {
      filterBy += ` AND j.name_kegiatan_audit ~* $${n}`;
      file.push(project_name);
      n++;
      countFilter += ` AND j.name_kegiatan_audit ~* $${c}`;
      countFile.push(project_name);
      c++;
    }
    if (maker) {
      filterBy += ` AND pic_jadwal_audit ->> 'pn' ~* $${n}`;
      file.push(maker);
      n++;
      countFilter += ` AND pic_jadwal_audit ->> 'pn' ~* $${c}`;
      countFile.push(maker);
      c++;
    }

    if (ref_metode) {
      filterBy += ` AND ref_metode->> 'kode' ~* $${n}`;
      file.push(ref_metode);
      n++;
      countFilter += ` AND ref_metode ->> 'kode' ~* $${c}`;
      countFile.push(ref_metode);
      c++;
    }
    if (ref_tipe) {
      filterBy += ` AND ref_tipe->> 'kode' ~* $${n}`;
      file.push(ref_tipe);
      n++;
      countFilter += ` AND ref_tipe ->> 'kode' ~* $${c}`;
      countFile.push(ref_tipe);
      c++;
    }
    if (ref_jenis) {
      filterBy += ` AND ref_jenis->> 'kode' ~* $${n}`;
      file.push(ref_jenis);
      n++;
      countFilter += ` AND ref_jenis ->> 'kode' ~* $${c}`;
      countFile.push(ref_jenis);
      c++;
    }
    if (ref_tema) {
      filterBy += ` AND ref_tema->> 'kode' ~* $${n}`;
      file.push(ref_tema);
      n++;
      countFilter += ` AND ref_tema ->> 'kode' ~* $${c}`;
      countFile.push(ref_tema);
      c++;
    }
    if (start) {
      filterBy += ` AND pelaksanaan_start >= $${n}`;
      file.push(start);
      n++;
      countFilter += ` AND pelaksanaan_start >= $${c}`;
      countFile.push(start);
      c++;
    }
    if (end) {
      filterBy += ` AND pelaksanaan_end <= $${n}`;
      file.push(end);
      n++;
      countFilter += ` AND pelaksanaan_end <= $${c}`;
      countFile.push(end);
      c++;
    }
    if (timAudit) {
      filterBy += ` AND j.tim_audit_id= $${n}`;
      file.push(timAudit);
      n++;
      countFilter += ` AND j.tim_audit_id= $${c}`;
      countFile.push(timAudit);
      c++;
    }
    const jadwal = await sequelize.query(
      queries.filterJadwal + filterBy + sort + str,
      {
        bind: file,
        type: QueryTypes.SELECT,
      }
    );

    const countJadwal = await sequelize.query(
      queries.filterJadwal + countFilter,
      {
        bind: countFile,
        type: QueryTypes.SELECT,
      }
    );
    // let groupedData = groupBy(jadwal, "id");
    // for (const key in groupedData) {
    //   dataReturn.push(groupedData[key][0]);
    // }
    const result = await Promise.all(
      jadwal.map(async (e) => await getJadwal(e))
    );

    let totalData = countJadwal.length


    if (result.length == 0)
      return sendResponse(res, 404, {
        status: "failed",
        statusCode: 404,
        message: "jadwal audit tidak ditemukan !",
      });

      return sendResponse(res, 200, {
        status: "success", result, pagination: { totalData: totalData} 
      })
  } catch (e) {
    
    return sendResponse(res, 500,{
      status: "failed",
      statusCode: 500,
      message: "Internal server error ! ",
      error: e,
    });
  }
};
const createJadwalAudit = async (request, res) => {
  try {
    const { pn, fullName, uka_kode, jabatan, role_kode } = request.user;
    const {
      pat_id,
      tim_audit_id,
      ref_metode,
      ref_tipe,
      ref_jenis,
      ref_tema,
      name_kegiatan_audit,
      deskripsi,
      tema_audit,
      uker,
      anggaran_kegiatan,
      anggaran_dinas,
      echannel,
    } = request.body;

    let { pelaksanaan_start, pelaksanaan_end } = request.body;
    const p = await findPATbyId(pat_id);
    if (!p) {
      return sendResponse(res, 404, {
        status: "failed",
        statusCode: 404,
        message: "PAT tidak ditemukan !",
      });
    }

    const findJadwal = await jadwal_audit.findOne({
      where: {
        pat_id,
        name_kegiatan_audit: {
          [Op.iLike]: name_kegiatan_audit
        }
      }
    })

    if(findJadwal){
      return sendResponse(res, 400, {
        status: "failed",
        message: "Jadwal sudah ada"
      })
    }
        
    const tim = await tim_audit.findOne({
      where: { id: tim_audit_id },
      include: [
        {
          model: ref_tim_audit_ata,
          attributes: ["pn_ata", "nama_ata", "jabatan"],
        },
        {
          model: ref_tim_audit_ma,
          attributes: ["pn_ma", "nama_ma", "jabatan"],
        },
        {
          model: ref_tim_audit_kta,
          attributes: ["pn_kta", "nama_kta", "jabatan"],
        },
      ],
    });
    if (!tim) {
      return sendResponse(res, 404, {
        status: "failed",
        statusCode: 404,
        message: "Tim audit tidak ditemukan !",
      });
    }
    if (p.uka_kode != uka_kode && !role_kode.includes("1")) {
      sendResponse(res, 403, { status: "failed", statusCode: 403, message: "Forbidden !" });
    }

    pelaksanaan_start = pelaksanaan_start.split("/").join("-");
    pelaksanaan_end = pelaksanaan_end.split("/").join("-");
    let jadwal;
    let total = 0;
    if (anggaran_dinas) {
      anggaran_dinas.forEach((e) => {
        total += Number(e.biaya_tiket_pp) || 0;
        total += Number(e.biaya_perjalanan_hari) || 0;
        total += Number(e.biaya_transport_lokal) || 0;
        total += Number(e.biaya_akomodasi) || 0;
      });
    }
    if (anggaran_kegiatan) {
      anggaran_kegiatan.forEach((e) => (total += Number(e.amount) || 0));
    }

    const result = await sequelize.transaction(
      // { isolationLevel: Transaction.ISOLATION_LEVELS.READ_COMMITTED },
      async (t) => {
        let branch = [];
        let orgeh = [];
        if (uker) {
          uker.forEach((e) => {
            branch.push(e.ref_auditee_branch_kode);
            orgeh.push(e.ref_auditee_orgeh_kode.toString());
          });
        }

        jadwal = await jadwal_audit.create(
          {
            pat_id,
            tim_audit_id,
            name_kegiatan_audit,
            count_target_jenis_auditee: null,
            ref_metode,
            ref_tipe,
            ref_jenis,
            ref_tema,
            deskripsi,
            total_anggaran: total,
            pelaksanaan_end,
            pelaksanaan_start,
            create_by: { pn, nama: fullName, jabatan },
            pic_jadwal_audit: { pn, nama: fullName, jabatan },
          },
          { transaction: t }
        );

        if (uker) {
          uker.forEach((e) => {
            e["jadwal_audit_id"] = jadwal.id;
            e["create_by"] = { pn, nama: fullName, jabatan };
          });
          await auditee_jadwal_audit.bulkCreate(uker, {
            transaction: t,
          });

          jadwal.count_target_jenis_auditee = await showTargetForJadwalAudit(
            pat_id,
            p.uka_kode,
            jadwal.id,
            t
          );
          jadwal.save({ transaction: t });
        }
        const allEchannel = await sequelize.query(queries.echannel, {
          type: QueryTypes.SELECT,
        });
        await Promise.all(
          allEchannel.map(async (e) => {
            await echannel_jadwal_audit.create({
              ref_echanel_type_kode: { kode: e.kode, name: e.name },
              jumlah_existing: 0,
              jumlah_target: 0,
              posisi_data: null,
              jadwal_audit_id: jadwal.id,
              create_by: { pn, nama: fullName, jabatan },
            });
          }),
          { transaction: t }
        );
        if (echannel) {
          await Promise.all(
            echannel.map(async (e) => {
              await echannel_jadwal_audit.update(
                {
                  jumlah_existing: e.jumlah_existing,
                  jumlah_target: e.jumlah_target,
                  posisi_data: e.posisi_data,
                },
                {
                  where: {
                    jadwal_audit_id: jadwal.id,
                    "ref_echanel_type_kode.kode": e.ref_echanel_type_kode.kode,
                  },
                }
              );
            }),
            { transaction: t }
          );
        }
        const sub = await ref_sub_kategori_anggaran.findAll();
        await Promise.all(
          sub.map(async (e) => {
            await anggaran_kegiatan_jadwal_audit.create({
              jadwal_audit_id: jadwal.id,
              ref_sub_kategori_anggaran_kode: {
                ref_sub_kategori_anggaran_kode: e.id,
                ref_sub_kategori_anggaran_name: e.nama,
              },
              amount: 0,
              create_by: { pn, nama: fullName, jabatan },
            });
          }),
          { transaction: t }
        );
        if (tim) {
          await Promise.all(
            tim.ref_tim_audit_ata.map(async (e) => {
              await anggaran_perjalanan_dinas_jadwal_audit.create({
                pn_auditor: {
                  pn: e.pn_ata,
                  nama: e.nama_ata,
                  jabatan: e.jabatan,
                },
                jadwal_audit_id: jadwal.id,
                biaya_perjalanan_hari: 0,
                biaya_tiket_pp: 0,
                biaya_transport_lokal: 0,
                biaya_akomodasi: 0,
                create_by: { pn, nama: fullName, jabatan },
              });
            }),
            tim?.ref_tim_audit_mas.map(async (e) => {
              await anggaran_perjalanan_dinas_jadwal_audit.create({
                pn_auditor: {
                  pn: e.pn_ma,
                  nama: e.nama_ma,
                  jabatan: e.jabatan,
                },
                jadwal_audit_id: jadwal.id,
                biaya_perjalanan_hari: 0,
                biaya_tiket_pp: 0,
                biaya_transport_lokal: 0,
                biaya_akomodasi: 0,
                create_by: { pn, nama: fullName, jabatan },
              });
            }),
            tim?.ref_tim_audit_kta.map(async (e) => {
              await anggaran_perjalanan_dinas_jadwal_audit.create({
                pn_auditor: {
                  pn: e.pn_kta,
                  nama: e.nama_kta,
                  jabatan: e.jabatan,
                },
                jadwal_audit_id: jadwal.id,
                biaya_perjalanan_hari: 0,
                biaya_tiket_pp: 0,
                biaya_transport_lokal: 0,
                biaya_akomodasi: 0,
                create_by: { pn, nama: fullName, jabatan },
              });
            }),
            { transaction: t }
          );
        }

        if (anggaran_kegiatan) {
          await Promise.all(
            anggaran_kegiatan.map(async (e) => {
              await anggaran_kegiatan_jadwal_audit.update(
                { amount: e.amount },
                {
                  where: {
                    jadwal_audit_id: jadwal.id,
                    "ref_sub_kategori_anggaran_kode.ref_sub_kategori_anggaran_kode":
                      e.ref_sub_kategori_anggaran_kode
                        .ref_sub_kategori_anggaran_kode,
                  },
                }
              );
            }),
            { transaction: t }
          );
        }
      }
    );
    if (anggaran_dinas) {
      await Promise.all(
        anggaran_dinas.map(async (e) => {
          await anggaran_perjalanan_dinas_jadwal_audit.update(
            {
              biaya_perjalanan_hari: e.biaya_perjalanan_hari,
              biaya_tiket_pp: e.biaya_tiket_pp,
              biaya_transport_lokal: e.biaya_transport_lokal,
              biaya_akomodasi: e.biaya_akomodasi,
            },
            {
              where: {
                "pn_auditor.pn": e.pn_auditor.pn,
                jadwal_audit_id: jadwal.id,
              },
            }
          );
        })
      );
    }

    if (jadwal) {
      await anggaran_perjalanan_dinas_jadwal_audit.update(
        { lama_kegiatan: await getDays(jadwal.id) },
        { where: { jadwal_audit_id: jadwal.id } }
      );
    }
    sendResponse(res, 201, { status: "success", statusCode: 201, data: jadwal });
  } catch (e) {
    
    return sendResponse(res, 500,{
      status: "failed",
      message: "Internal server error ! ",
      error: e,
    });
  }
};
const deleteAudit = async (id, pat_id) => {
  // try {
  const p = await findPATbyId(pat_id);
  const result = await sequelize.transaction(
    { isolationLevel: Transaction.ISOLATION_LEVELS.READ_COMMITTED },
    async (t) => {
      await Promise.all([
        auditee_jadwal_audit.destroy(
          {
            where: {
              jadwal_audit_id: id,
            },
          },
          { transaction: t }
        ),
        echannel_jadwal_audit.destroy(
          {
            where: {
              jadwal_audit_id: id,
            },
          },
          { transaction: t }
        ),
        anggaran_perjalanan_dinas_jadwal_audit.destroy(
          {
            where: {
              jadwal_audit_id: id,
            },
          },
          { transaction: t }
        ),
        anggaran_kegiatan_jadwal_audit.destroy(
          {
            where: {
              jadwal_audit_id: id,
            },
          },
          { transaction: t }
        ),
      ]);
      await jadwal_audit.destroy(
        {
          where: {
            id,
          },
        },
        { transaction: t }
      );
    }
  );
  return "jadwal audit berhasil di hapus !";
  // } catch (e) {
  //   throw new Error();
  // }
};
const deleteJadwalAudit = async (req, res) => {
  try {
    const { jadwal_id, pat_id } = req.query;
    const { pn, role_kode } = req.user;
    const jadwal = await jadwal_audit.findByPk(jadwal_id);
    if (!jadwal) {
      return sendResponse(res, 400, {
        status: "failed",
        message: "jadwal audit tidak ditemukan !",
      });
    }
    if (jadwal.pic_jadwal_audit.pn != pn && !role_kode.includes("1")) {
      return sendResponse(res, 403, { status: "failed", statusCode: 403, message: "Forbidden !" });
    }
    const audit = await deleteAudit(jadwal_id, pat_id);
    return sendResponse(res, 200, {
      status: "success",
      statusCode: 200,
      message: audit,
    })
 
  } catch (e) {
    
    return sendResponse(res, 500,{
      status: "failed",
      message: "Internal server error ! ",
      error: e,
    });
  }
};
const updateAudit = async (
  ref_metode,
  ref_tipe,
  ref_jenis,
  ref_tema,
  pat_id,
  jadwal_audit_id,
  echannel,
  uker,
  anggaran_dinas,
  anggaran_kegiatan,
  tim_audit_id,
  name_kegiatan_audit,
  tema_audit,
  pelaksanaan_end,
  pelaksanaan_start,
  pn,
  fullName,
  jabatan
) => {
  try {
    const p = await findPATbyId(pat_id);
    if (pelaksanaan_start) {
      pelaksanaan_start = pelaksanaan_start.split("/").join("-");
    }
    if (pelaksanaan_end) {
      pelaksanaan_end = pelaksanaan_end.split("/").join("-");
    }

    let total = 0;
    if (anggaran_dinas) {
      anggaran_dinas.forEach((e) => {
        total += Number(e.biaya_tiket_pp) || 0;
        total += Number(e.biaya_perjalanan_hari) || 0;
        total += Number(e.biaya_transport_lokal) || 0;
        total += Number(e.biaya_akomodasi) || 0;
      });
    }
    if (anggaran_kegiatan) {
      anggaran_kegiatan.forEach((e) => (total += Number(e.amount) || 0));
    }
    const result = await sequelize.transaction(
      { isolationLevel: Transaction.ISOLATION_LEVELS.READ_COMMITTED },
      async (t) => {
        await Promise.all([
          anggaran_kegiatan_jadwal_audit.destroy({
            where: { jadwal_audit_id },
          }),
          anggaran_perjalanan_dinas_jadwal_audit.destroy({
            where: { jadwal_audit_id },
          }),
          echannel_jadwal_audit.destroy({
            where: { jadwal_audit_id },
          }),
          auditee_jadwal_audit.destroy({
            where: { jadwal_audit_id },
          }),
        ]);

        if (uker) {
          uker.forEach((e) => {
            e["jadwal_audit_id"] = jadwal_audit_id;
            e["create_by"] = { pn, nama: fullName, jabatan };
            e["update_by"] = { pn, nama: fullName, jabatan };
          });
          await auditee_jadwal_audit.bulkCreate(uker, {
            transaction: t,
          });
        }

        const target_audit = await showTargetForJadwalAudit(
          pat_id,
          p.uka_kode,
          jadwal_audit_id,
          t
        );

        await jadwal_audit.update(
          {
            tema_audit: null,
            ref_metode,
            ref_tipe,
            ref_jenis,
            ref_tema,
            count_target_jenis_auditee: target_audit,
            tim_audit_id,
            total_anggaran: total,
            name_kegiatan_audit,
            pelaksanaan_end,
            pelaksanaan_start,
            update_by: { pn, nama: fullName, jabatan },
          },
          { where: { id: jadwal_audit_id } },
          { transaction: t }
        );

        const allEchannel = await sequelize.query(queries.echannel, {
          type: QueryTypes.SELECT,
        });
        await Promise.all(
          allEchannel.map(async (e) => {
            await echannel_jadwal_audit.create({
              ref_echanel_type_kode: { kode: e.kode, name: e.name },
              jumlah_existing: 0,
              jumlah_target: 0,
              posisi_data: null,
              jadwal_audit_id: jadwal_audit_id,
              create_by: { pn, nama: fullName, jabatan },
            });
          }),
          { transaction: t }
        );
        if (echannel) {
          await Promise.all(
            echannel.map(async (e) => {
              await echannel_jadwal_audit.update(
                {
                  jumlah_existing: e.jumlah_existing,
                  jumlah_target: e.jumlah_target,
                  posisi_data: e.posisi_data,
                },
                {
                  where: {
                    jadwal_audit_id,
                    "ref_echanel_type_kode.kode": e.ref_echanel_type_kode.kode,
                  },
                }
              );
            }),
            { transaction: t }
          );
        }
        const sub = await ref_sub_kategori_anggaran.findAll();
        await Promise.all(
          sub.map(async (e) => {
            await anggaran_kegiatan_jadwal_audit.create({
              jadwal_audit_id: jadwal_audit_id,
              ref_sub_kategori_anggaran_kode: {
                ref_sub_kategori_anggaran_kode: e.id,
                ref_sub_kategori_anggaran_name: e.nama,
              },
              amount: 0,
              create_by: { pn, nama: fullName, jabatan },
            });
          }),
          { transaction: t }
        );
        const tim = await tim_audit.findOne(
          {
            where: { id: tim_audit_id },
            include: [
              {
                model: ref_tim_audit_ata,
                attributes: ["pn_ata", "nama_ata", "jabatan"],
              },
              {
                model: ref_tim_audit_ma,
                attributes: ["pn_ma", "nama_ma", "jabatan"],
              },
              {
                model: ref_tim_audit_kta,
                attributes: ["pn_kta", "nama_kta", "jabatan"],
              },
            ],
          },
          { transaction: t }
        );

        if (tim) {
          await Promise.all(
            tim.ref_tim_audit_ata.map(async (e) => {
              await anggaran_perjalanan_dinas_jadwal_audit.create({
                pn_auditor: {
                  pn: e.pn_ata,
                  nama: e.nama_ata,
                  jabatan: e.jabatan,
                },
                jadwal_audit_id: jadwal_audit_id,
                biaya_perjalanan_hari: 0,
                biaya_tiket_pp: 0,
                biaya_transport_lokal: 0,
                biaya_akomodasi: 0,
                create_by: { pn, nama: fullName, jabatan },
              });
            }),
            tim.ref_tim_audit_mas.map(async (e) => {
              await anggaran_perjalanan_dinas_jadwal_audit.create({
                pn_auditor: {
                  pn: e.pn_ma,
                  nama: e.nama_ma,
                  jabatan: e.jabatan,
                },
                jadwal_audit_id: jadwal_audit_id,
                biaya_perjalanan_hari: 0,
                biaya_tiket_pp: 0,
                biaya_transport_lokal: 0,
                biaya_akomodasi: 0,
                create_by: { pn, nama: fullName, jabatan },
              });
            }),
            tim.ref_tim_audit_kta.map(async (e) => {
              await anggaran_perjalanan_dinas_jadwal_audit.create({
                pn_auditor: {
                  pn: e.pn_kta,
                  nama: e.nama_kta,
                  jabatan: e.jabatan,
                },
                jadwal_audit_id: jadwal_audit_id,
                biaya_perjalanan_hari: 0,
                biaya_tiket_pp: 0,
                biaya_transport_lokal: 0,
                biaya_akomodasi: 0,
                create_by: { pn, nama: fullName, jabatan },
              });
            }),
            { transaction: t }
          );
        }

        if (anggaran_kegiatan) {
          await Promise.all(
            anggaran_kegiatan.map(async (e) => {
              await anggaran_kegiatan_jadwal_audit.update(
                { amount: e.amount },
                {
                  where: {
                    jadwal_audit_id: jadwal_audit_id,
                    "ref_sub_kategori_anggaran_kode.ref_sub_kategori_anggaran_kode":
                      e.ref_sub_kategori_anggaran_kode
                        .ref_sub_kategori_anggaran_kode,
                  },
                }
              );
            }),
            { transaction: t }
          );
        }
        if (anggaran_dinas) {
          await Promise.all(
            anggaran_dinas.map(async (e) => {
              await anggaran_perjalanan_dinas_jadwal_audit.update(
                {
                  biaya_perjalanan_hari: Number(e.biaya_perjalanan_hari),
                  biaya_tiket_pp: Number(e.biaya_tiket_pp),
                  biaya_transport_lokal: Number(e.biaya_transport_lokal),
                  biaya_akomodasi: Number(e.biaya_akomodasi),
                },
                {
                  where: {
                    "pn_auditor.pn": e.pn_auditor.pn,
                    jadwal_audit_id: jadwal_audit_id,
                  },
                }
              );
            }),
            { transaction: t }
          );
        }
      }
    );

    if (jadwal_audit_id) {
      await anggaran_perjalanan_dinas_jadwal_audit.update(
        { lama_kegiatan: await getDays(jadwal_audit_id) },
        { where: { jadwal_audit_id: jadwal_audit_id } }
      );
    }
    return "Berhasil update jadwal";
  } catch (e) {
    
    throw new Error(e);
  }
};
const updateJadwalAudit = async (req, res) => {
  try {
    const { pn, fullName, jabatan } = req.user;
    const {
      pat_id,
      jadwal_audit_id,
      echannel,
      ref_metode,
      ref_tipe,
      ref_jenis,
      ref_tema,
      uker,
      anggaran_dinas,
      anggaran_kegiatan,
      tim_audit_id,
      name_kegiatan_audit,
      tema_audit,
    } = req.body;
    let { pelaksanaan_end, pelaksanaan_start } = req.body;

    const jadwal = await jadwal_audit.findByPk(jadwal_audit_id);
    if (!jadwal) {
      return sendResponse(res, 404, {
        status: "failed",
        statusCode: 404,
        message: "Jadwal tidak ditemukan !",
      });
    }
    if (jadwal.pic_jadwal_audit.pn != pn) {
      return sendResponse(res, 403, {
        status: "failed",
        statusCode: 403,
        message: "Forbidden !",
      });
    }
    if(name_kegiatan_audit){
			const findJadwal = await jadwal_audit.findOne({
				where: {
				  pat_id,
				  name_kegiatan_audit: {
					[Op.iLike]: name_kegiatan_audit
				  },
          id: {
            [Op.ne]: jadwal_audit_id
          }
				}
			  })
		  
			  if(findJadwal){
				return sendResponse(res, 400, {
				  status: "failed",
				  message: "Jadwal sudah ada"
				})
			  }	
		}
    const audit = await updateAudit(
      ref_metode,
      ref_tipe,
      ref_jenis,
      ref_tema,
      pat_id,
      jadwal_audit_id,
      echannel,
      uker,
      anggaran_dinas,
      anggaran_kegiatan,
      tim_audit_id,
      name_kegiatan_audit,
      tema_audit,
      pelaksanaan_end,
      pelaksanaan_start,
      pn,
      fullName,
      jabatan
    );
    return sendResponse(res, 200, {
      status: "success",
      statusCode: 200,
      message: audit,
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

module.exports = {
  getJadwalDetails,
  getCountTarget,
  getJadwal,
  getDays,
  getJadwalAudit,
  showJadwalAuditByIdDetails,
  showAllJadwalAudit,
  createJadwalAudit,
  deleteJadwalAudit,
  updateJadwalAudit,
  queries,
  auditScheme,
  updateAudit,
  deleteAudit,
};
