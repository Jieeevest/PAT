const {
  tim_audit,
  sequelize,
  anggaran_perjalanan_dinas_jadwal_audit,
  anggaran_kegiatan_jadwal_audit,
  auditee_jadwal_audit,
  echannel_jadwal_audit,
  jadwal_audit,
  ref_tim_audit_ata,
  ref_tim_audit_ma,
  ref_tim_audit_kta,
  ref_ata_uker,
} = require("../models");
const { findPATbyId } = require("../utils/PAT");
const { QueryTypes } = require("sequelize");
const { Transaction, Op } = require("sequelize");
const { groupBy } = require("lodash");
const {
  statusValidate,
  isSuperAdmin,
  ukaValidate,
} = require("../utils/generalValidation");
const {
  internalServerError,
  forbidden,
  found,
  sendResponse,
} = require("../utils/errorReturn");
const timQueries = {
  allTimDetail: `
    SELECT t.id as tim_id ,pat_id,t.name as tim_name,a.id as id_ata,pn_ata,nama_ata,u.id as id_uker, u.orgeh_kode, u.orgeh_name, u.branch_kode, u.branch_name,
    m.id as id_ma,m.pn_ma,m.nama_ma,k.id as id_kta,k.pn_kta, k.nama_kta,pic_maker_tim_audit
    FROM pat.tim_audit as t
    LEFT JOIN pat.ref_tim_audit_ata a ON a.tim_audit_id = t.id
    LEFT JOIN pat.ref_tim_audit_ma m ON m.tim_audit_id = t.id
    LEFT JOIN pat.ref_tim_audit_kta k ON k.tim_audit_id = t.id
    LEFT JOIN pat.ref_ata_uker u ON u.ref_tim_audit_ata_id = a.id
    WHERE t.id = $1
    `,
  findFilterTim: `
    SELECT DISTINCT t.id, t.name as tim_name
    FROM pat.tim_audit as t
    LEFT JOIN pat.ref_tim_audit_ata a ON a.tim_audit_id = t.id
    LEFT JOIN pat.ref_tim_audit_ma m ON m.tim_audit_id = t.id
    LEFT JOIN pat.ref_tim_audit_kta k ON k.tim_audit_id = t.id
    LEFT JOIN pat.ref_ata_uker u ON u.ref_tim_audit_ata_id = a.id
    WHERE pat_id=$1 
    `,
  timDetails: `
    SELECT t.id as tim_id ,pat_id,t.name as tim_name,a.id as id_ata,pn_ata,nama_ata,u.id as id_uker,
    u.branch_kode,u.orgeh_kode,u.orgeh_name,k.id as id_kta,k.pn_kta,k.nama_kta,m.id as id_ma,m.nama_ma,m.pn_ma,pic_maker_tim_audit, u.branch_name
    FROM pat.tim_audit as t
    LEFT JOIN pat.ref_tim_audit_ata a ON a.tim_audit_id = t.id
    LEFT JOIN pat.ref_ata_uker u ON u.ref_tim_audit_ata_id = a.id
    LEFT JOIN pat.ref_tim_audit_ma m ON a.tim_audit_id = t.id
    LEFT JOIN pat.ref_tim_audit_kta k ON a.tim_audit_id = t.id
    WHERE pat_id=$1 AND t.id= $2
    `,
};
// const allTimScheme = {
//   "$group[tim_audit](tim_id)": {
//     id: "tim_id",
//     name: "tim_name",
//     pn_pic: "pic_maker_tim_audit.pn",
//     nama_pic: "pic_maker_tim_audit.nama",
//     jabatan_pic: "pic_maker_tim_audit.jabatan",
//     pn_ma: "pn_ma.pn",
//     nama_ma: "pn_ma.nama",
//     jabatan_ma: "pn_ma.jabatan",
//     pn_kta: "pn_kta.pn",
//     nama_kta: "pn_kta.nama",
//     jabatan_kta: "pn_kta.jabatan",
//     "$group[atas](id_ata)": {
//       id: "id_ata",
//       pn: "pn_ata",
//       name: "nama_ata",
//       jabatan: "jabatan",
//       "$group[uker](id_uker)": {
//         orgeh: "orgeh",
//         orgeh_name: "orgeh_name",
//         branch: "branch",
//         branch_name: "branch_name",
//       },
//     },
//   },
// };
const getTim = async (e) => {
  try {
    const tim = await tim_audit.findOne({
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
      where: { id: e.id },
    });
    // const tim = await sequelize.query(timQueries.allTimDetail, {
    //   bind: [e.id],
    //   types: QueryTypes.SELECT,
    // });
    return tim;
  } catch (e) {
    
    throw new Error();
  }
};

const getTimAudit = async (pat_id) => {
  try {
    const r = await tim_audit.findOne({
      where: {
        pat_id,
      },
      attributes: ["pic_maker_tim_audit"],
    });
    return r;
  } catch (e) {
    throw new Error("tidak ditemukan !");
  }
};
const getTimDetails = async (pat_id, id) => {
  try {
    const tim = await tim_audit.findOne({
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
      where: { pat_id, id },
    });

    return tim;
  } catch (e) {
    throw new Error();
  }
};
const findTimFromPAT = async (req, res) => {
  try {
    const { pat_id } = req.query;
    const tim = await tim_audit.findAll({
      include: [
        {
          model: ref_tim_audit_ata,
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
    if (tim.length == 0) {
      return sendResponse(res, 404, {
        status: "failed",
        statusCode: 404,
        message: "Tim tidak ditemukan ",
      });
    }
    sendResponse(res, 200, { status: "success", statusCode: 200, data: tim });
  } catch (e) {
    
    return internalServerError(res, e);
  }
};
const showAllTimAudit = async (req, res) => {
  try {
    const { pat_id, page, tim_name, nama_kta, nama_ma, nama_ata, nama_uker } =
      req.query;
    let { limit } = req.query;
    let { sortBy } = req.query;
    let sort = "";
    const file = [
      pat_id,
      parseInt(limit, 10),
      (parseInt(page, 10) - 1) * parseInt(limit, 10),
    ];
    const forCountFile = [pat_id];
    let c = 2;
    let n = 4;
    let forCountStr = "";
    let filterBy = "";

    if (sortBy) {
      sort = `
          ORDER BY ${sortBy}
          `;
    }

    if (tim_name) {
      filterBy += ` AND t.name ~* $${n}`;
      forCountStr += ` AND t.name ~* $${c}`;
      file.push(tim_name);
      forCountFile.push(tim_name);
      n++;
      c++;
    }
    if (nama_kta) {
      filterBy += ` AND k.nama_kta ~* $${n}`;
      forCountStr += ` AND k.nama_kta ~* $${c}`;
      file.push(nama_kta);
      forCountFile.push(nama_kta);
      n++;
      c++;
    }
    if (nama_ma) {
      filterBy += ` AND m.nama_ma ~* $${n}`;
      forCountStr += ` AND m.nama_ma ~* $${c}`;
      file.push(nama_ma);
      forCountFile.push(nama_ma);
      n++;
      c++;
    }
    if (nama_ata) {
      filterBy += ` AND a.nama_ata ~* $${n}`;
      forCountStr += ` AND a.nama_ata ~* $${c}`;
      file.push(nama_ata);
      forCountFile.push(nama_ata);
      n++;
      c++;
    }

    const str = `
    LIMIT $2
    OFFSET $3
    `;

    const tim = await sequelize.query(
      timQueries.findFilterTim + filterBy + sort + str,
      {
        bind: file,
        type: QueryTypes.SELECT,
      }
    );
    const countTim = await sequelize.query(
      timQueries.findFilterTim + forCountStr,
      {
        bind: forCountFile,
        type: QueryTypes.SELECT,
      }
    );
    // const tim = await client.query(
    //   timQueries.findFilterTim + filterBy + str,
    //   file
    // );
    // const countTim = await client.query(
    //   timQueries.findFilterTim + forCountStr,
    //   forCountFile
    // );
    // client.release();

    const result = await Promise.all(tim.map(async (e) => await getTim(e)));

    if (result.length == 0)
      return sendResponse(res, 404, {
        status: "failed",
        statusCode: 404,
        message: "tim is tidak ditemukan !",
      });

    const detailPage = {
      totalData: countTim.length
    };

    return sendResponse(res, 200, {
      status: "success",
      statusCode: 200,
      data: result,
      pagination: detailPage,
    })
  } catch (e) {
    
    return internalServerError(res, e);
  }
};

const showTimAuditById = async (req, res) => {
  try {
    const { tim_id, pat_id } = req.query;
    const { uka_kode } = req.user;
    const rex = /pska/gi;
    const p = await findPATbyId(pat_id);

    // if (p.uka_kode != uka_kode && uka_kode.match(rex) == null) {
    //   return sendResponse(res, 403, {
    //     status: "failed",
    //     statusCode: 403,
    //     message: "Forbidden !",
    //   });
    // }
    const output = await getTimDetails(pat_id, tim_id);
    if (!output) {
      return sendResponse(res, 404, {
        status: "failed",
        statusCode: 404,
        message: "Tim tidak ditemukan !",
      });
    }
    return sendResponse(res, 200, {
      status: "success",
      statusCode: 200,
      data: output,
    })
  } catch (e) {
    return internalServerError(res, e);
  }
};
const createTim = async (
  pat_id,
  name,
  ma,
  kta,
  atas_ukers,
  pn,
  fullName,
  jabatan,
  ref_tipe_tim
) => {
  // try {
  let tim;
  const result = await sequelize.transaction(
    { isolationLevel: Transaction.ISOLATION_LEVELS.READ_COMMITTED },
    async (t) => {
      tim = await tim_audit.create(
        {
          pat_id,
          name,
          ref_tipe_tim,
          pic_maker_tim_audit: { pn, nama: fullName, jabatan },
          create_by: { pn, nama: fullName, jabatan },
        },
        { transaction: t }
      );
      if (ma && kta && atas_ukers) {
        await Promise.all(
          ma.map(async (e) => {
            await ref_tim_audit_ma.create({
              pn_ma: e.pn,
              nama_ma: e.nama,
              jabatan: e.jabatan,
              tim_audit_id: tim.id,
              create_by: { pn, nama: fullName, jabatan },
            });
          }),
          kta.map(async (e) => {
            await ref_tim_audit_kta.create({
              pn_kta: e.pn,
              nama_kta: e.nama,
              jabatan: e.jabatan,
              tim_audit_id: tim.id,
              create_by: { pn, nama: fullName, jabatan },
            });
          }),
          atas_ukers.map(async (e) => {
            const ata = await ref_tim_audit_ata.create({
              pn_ata: e.pn,
              nama_ata: e.nama,
              jabatan: e.jabatan,
              tim_audit_id: tim.id,
              create_by: { pn, nama: fullName, jabatan },
            });
            if (e.uker_binaans) {
              await Promise.all(
                e.uker_binaans.map(async (c) => {
                  await ref_ata_uker.create({
                    orgeh_kode: c.orgeh_kode,
                    orgeh_name: c.orgeh_name,
                    branch_name: c.branch_name,
                    branch_kode: c.branch_kode,
                    ref_tim_audit_ata_id: ata.id,
                    tim_audit_id: tim.id,
                    create_by: { pn, nama: fullName, jabatan },
                  });
                }),
                { transaction: t }
              );
            }
          }),
          { transaction: t }
        );
      }
    }
  );
  return tim;
  // } catch (e) {
  //   throw new Error();
  // }
};
const createTimAudit = async (req, res) => {
  try {
    const {
      pat_id,
      name,
      ref_tipe_tim,
      ref_tim_audit_ma,
      ref_tim_audit_kta,
      ref_tim_audit_ata,
    } = req.body;
    const { pn, fullName, uka_kode, jabatan, role_kode } = req.user;
    const p = await findPATbyId(pat_id);
    const isValid = statusValidate(pat_id, role_kode);
    if (!isValid || (!ukaValidate(p.uka, uka_kode) && !isSuperAdmin(role_kode)))
      return sendResponse(res, 403, {
        status: "failed",
        statusCode: 403,
        message: "Forbidden!",
      });
    let timIsTrue = true;
    const findTim = await tim_audit.findAll({
      where: { name: { [Op.iRegexp]: name }, pat_id },
    });
    await Promise.all(
      findTim.map(async (e) => {
        if (e.name.toLowerCase() == name.toLowerCase()) timIsTrue = false;
      })
    );
    if (!timIsTrue) {
      return sendResponse(res, 403, {
        status: "failed",
        statusCode: 403,
        message: "nama Tim sudah ada",
      });
    }
    const tim = await createTim(
      pat_id,
      name,
      ref_tim_audit_ma,
      ref_tim_audit_kta,
      ref_tim_audit_ata,
      pn,
      fullName,
      jabatan,
      ref_tipe_tim
    );
    return sendResponse(res, 200, {
      status: "success",
      statusCode: 200,
      data: tim,
    })

  } catch (e) {
    
    return internalServerError(res, e);
  }
};
const updateTim = async (
  tim_audit_id,
  name,
  mas,
  ktas,
  atas_ukers,
  pn,
  fullName,
  jabatan,
  ref_tipe_tim
) => {
  // try {
  const result = await sequelize.transaction(
    { isolationLevel: Transaction.ISOLATION_LEVELS.READ_COMMITTED },
    async (t) => {
      const jadwal = await jadwal_audit.findOne({
        where: {
          tim_audit_id,
        },
      });

      let changes = false;
      atas_ukers.forEach(async (e) => {
        const c = await ref_tim_audit_ata.findOne({
          where: { pn_ata: e.pn },
        });
        if (c) changes = true;
      });
      if (jadwal && changes) {
        let findAnggaranDinas =
          await anggaran_perjalanan_dinas_jadwal_audit.findAll({
            where: {
              jadwal_audit_id: jadwal.id,
            },
          });
        let findAnggaranKegiatan = await anggaran_kegiatan_jadwal_audit.findAll(
          {
            where: {
              jadwal_audit_id: jadwal.id,
            },
          }
        );

        if (findAnggaranDinas.length > 0) {
          let d = [];
          findAnggaranDinas.forEach((e) => {
            d.push(e.id);
          });
          await anggaran_perjalanan_dinas_jadwal_audit.destroy(
            {
              where: {
                id: d,
              },
            },
            { transaction: t }
          );
        }
        if (findAnggaranKegiatan.length > 0) {
          let d = [];
          findAnggaranKegiatan.forEach((e) => {
            d.push(e.id);
          });
          await anggaran_kegiatan_jadwal_audit.destroy(
            {
              where: {
                id: d,
              },
            },
            { transaction: t }
          );
        }
      }
      const [atas, uker, ma, kta] = await Promise.all([
        ref_tim_audit_ata.findAll({
          where: { tim_audit_id },
        }),
        ref_ata_uker.findAll({
          where: { tim_audit_id },
        }),
        ref_tim_audit_ma.findAll({
          where: { tim_audit_id },
        }),
        ref_tim_audit_kta.findAll({
          where: { tim_audit_id },
        }),
      ]);
      if (atas.length > 0) {
        let d = [];
        atas.forEach((e) => d.push(e.id));
        await ref_tim_audit_ata.destroy(
          { where: { id: d } },
          { transaction: t }
        );
      }

      if (uker.length > 0) {
        let d = [];
        uker.forEach((e) => d.push(e.id));
        await ref_ata_uker.destroy({ where: { id: d } }, { transaction: t });
      }
      if (ma.length > 0) {
        let d = [];
        ma.forEach((e) => d.push(e.id));
        await ref_tim_audit_ma.destroy(
          { where: { id: d } },
          { transaction: t }
        );
      }
      if (kta.length > 0) {
        let d = [];
        kta.forEach((e) => d.push(e.id));
        await ref_tim_audit_kta.destroy(
          { where: { id: d } },
          { transaction: t }
        );
      }

      if (atas_ukers && mas && ktas) {
        await Promise.all(
          atas_ukers.map(async (e) => {
            const ata = await ref_tim_audit_ata.create({
              pn_ata: e.pn,
              nama_ata: e.nama,
              jabatan: e.jabatan,
              tim_audit_id,
              create_by: { pn, nama: fullName, jabatan },
              update_by: { pn, nama: fullName, jabatan },
            });
            if (e.uker_binaans) {
              await Promise.all(
                e.uker_binaans.map(async (c) => {
                  await ref_ata_uker.create({
                    orgeh_kode: c.orgeh_kode,
                    orgeh_name: c.orgeh_name,
                    branch_kode: c.branch_kode,
                    branch_name: c.branch_name,
                    ref_tim_audit_ata_id: ata.id,
                    tim_audit_id,
                    create_by: { pn, nama: fullName, jabatan },
                    update_by: { pn, nama: fullName, jabatan },
                  });
                }),
                { transaction: t }
              );
            }
          }),
          mas.map(async (e) => {
            await ref_tim_audit_ma.create({
              pn_ma: e.pn,
              nama_ma: e.nama,
              jabatan: e.jabatan,
              tim_audit_id,
              create_by: { pn, nama: fullName, jabatan },
            });
          }),
          ktas.map(async (e) => {
            await ref_tim_audit_kta.create({
              pn_kta: e.pn,
              nama_kta: e.nama,
              jabatan: e.jabatan,
              tim_audit_id,
              create_by: { pn, nama: fullName, jabatan },
            });
          }),
          { transaction: t }
        );
      }

      await tim_audit.update(
        {
          name,
          ref_tipe_tim,
          update_by: { pn, nama: fullName, jabatan },
        },
        { where: { id: tim_audit_id } },
        { transaction: t }
      );
    }
  );
  return "Tim has been updated !";
  // } catch (e) {
  //   throw new Error();
  // }
};
const updateTimAudit = async (req, res) => {
  try {
    const {
      pat_id,
      tim_audit_id,
      name,
      ref_tipe_tim,
      ref_tim_audit_ma,
      ref_tim_audit_kta,
      ref_tim_audit_ata,
    } = req.body;
    const { pn, fullName, jabatan, role_kode } = req.user;
    const isValid = statusValidate(pat_id);
    if (!isValid) return forbidden(res);
    const find_tim = await tim_audit.findByPk(tim_audit_id);
    if (find_tim.pic_maker_tim_audit.pn != pn && !isSuperAdmin(role_kode))
      return forbidden(res);
    if (name) {
      let timIsTrue = true
      const findTim = await tim_audit.findAll({
        where: { name: { [Op.iRegexp]: name }, pat_id, id: { [Op.ne]: tim_audit_id} },
      });
      await Promise.all(
        findTim.map(async (e) => {
          if (e.name.toLowerCase() == name.toLowerCase()) timIsTrue = false;
        })
      );
      if (!timIsTrue) {
        return sendResponse(res, 403, {
          status: "failed",
          statusCode: 403,
          message: "nama Tim sudah ada",
        });
      }
    }
    const tim = await updateTim(
      tim_audit_id,
      name,
      ref_tim_audit_ma,
      ref_tim_audit_kta,
      ref_tim_audit_ata,
      pn,
      fullName,
      jabatan,
      ref_tipe_tim
    );
    return found(res, tim);
  } catch (e) {
    
    return internalServerError(res, e);
  }
};
const deleteTim = async (id) => {
  // try {
  const result = await sequelize.transaction(
    { isolationLevel: Transaction.ISOLATION_LEVELS.READ_COMMITTED },
    async (t) => {
      let jadwal = await jadwal_audit.findAll({
        where: {
          tim_audit_id: id,
        },
      });
      if (jadwal.length) {
        const jadwalAuditIds = jadwal.map((e) => e.id);
        await Promise.all([
          echannel_jadwal_audit.destroy({
            where: { jadwal_audit_id: jadwalAuditIds },
            transaction: t,
          }),
          auditee_jadwal_audit.destroy({
            where: { jadwal_audit_id: jadwalAuditIds },
            transaction: t,
          }),
          anggaran_perjalanan_dinas_jadwal_audit.destroy({
            where: { jadwal_audit_id: jadwalAuditIds },
            transaction: t,
          }),
          anggaran_kegiatan_jadwal_audit.destroy({
            where: { jadwal_audit_id: jadwalAuditIds },
            transaction: t,
          }),
        ]);

        // Destroy jadwal_audit records using bulkDestroy
        await jadwal_audit.destroy({
          where: { id: jadwalAuditIds },
          transaction: t,
        });
      }
      await Promise.all([
        ref_tim_audit_ata.destroy(
          {
            where: {
              tim_audit_id: id,
            },
          },
          { transaction: t }
        ),
        ref_tim_audit_ma.destroy(
          {
            where: {
              tim_audit_id: id,
            },
          },
          { transaction: t }
        ),
        ref_tim_audit_kta.destroy(
          {
            where: {
              tim_audit_id: id,
            },
          },
          { transaction: t }
        ),
      ]);
      await tim_audit.destroy(
        {
          where: {
            id,
          },
        },
        { transaction: t }
      );
    }
  );
  return "Tim berhasil di hapus !";
  // } catch (e) {
  //   throw new Error();
  // }
};
const deleteTimAudit = async (req, res) => {
  try {
    const { tim_id, pat_id } = req.query;
    const { pn, role_kode } = req.user;
    const isValid = statusValidate(pat_id);
    if (!isValid)
      return sendResponse(res, 403, {
        status: "failed",
        statusCode: 403,
        message: "Forbidden!",
      });
    const p = await findPATbyId(pat_id);
    const find_tim = await tim_audit.findByPk(tim_id);
    if (!find_tim)
      return sendResponse(res, 404, {
        status: "failed",
        statusCode: 404,
        message: "Tim Audit is tidak ditemukan !",
      });
    if (find_tim.pic_maker_tim_audit.pn != pn && !isSuperAdmin(role_kode))
      return sendResponse(res, 403, {
        status: "failed",
        statusCode: 403,
        message: "Forbidden !",
      });

    const tim = await deleteTim(tim_id);

    return sendResponse(res, 200, {
      status: "success",
      statusCode: 200,
      message: tim,
    })
  } catch (e) {
    
    return internalServerError(res, e);
  }
};

const listTimAudit = async (req, res) => {
  try {
    const { pat_id } = req.query;
    const { pn, role_kode } = req.user;
    // const isValid = statusValidate(pat_id);
    // if (!isValid)
    //   return sendResponse(res, 403, {
    //     status: "failed",
    //     statusCode: 403,
    //     message: "Forbidden!",
    //   });
    const p = await findPATbyId(pat_id);

    const allTim = await tim_audit.findAll({
      where: {
        pat_id,
      },
      attributes: ["id", "name"],
    });
    return sendResponse(res, 200, {
      status: "success",
      statusCode: 200,
      message: "success",
      data: allTim,
    })
  } catch (e) {
    return internalServerError(res, e);
  }
};

module.exports = {
  // allTimScheme,
  timQueries,
  getTim,
  getTimDetails,
  getTimAudit,
  findTimFromPAT,
  showAllTimAudit,
  showTimAuditById,
  createTimAudit,
  updateTimAudit,
  deleteTimAudit,
  deleteTim,
  createTim,
  updateTim,
  listTimAudit,
};
