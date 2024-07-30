const { pat, request_reset_pat } = require("../models");
const { isSuperAdmin } = require("../utils/generalValidation");
const { QueryTypes } = require("sequelize");
const { sequelize } = require("../models");
const {
  internalServerError,
  forbidden,
  created,
  sendResponse,
} = require("../utils/errorReturn");

const queries = {
  uka: `
    SELECT name,kode
    FROM reference.uka
    WHERE is_active = true AND kode = $1
    `,
  filterPAT: `
    SELECT DISTINCT tahun
    FROM pat.pat
    `,
  countAIW: `
    SELECT COUNT(DISTINCT pat.id)   
    FROM pat.pat 
    WHERE uka_kode ~* 'kns' AND tahun = $1
    `,
  countAIKP: `
    SELECT COUNT(DISTINCT pat.id) 
    FROM pat.pat 
    WHERE uka_kode ~* 'aikp' AND tahun = $1
    `,
  countAITI: `
    SELECT COUNT(DISTINCT pat.id) 
    FROM pat.pat 
    WHERE uka_kode ~* 'aiti' AND tahun = $1
    `,
};

const countUKA = async (e) => {
  try {
    const aiw = await sequelize.query(queries.countAIW, {
      bind: [e.tahun],
      type: QueryTypes.SELECT,
    });

    const aikp = await sequelize.query(queries.countAIKP, {
      bind: [e.tahun],
      type: QueryTypes.SELECT,
    });
    const data = {
      tahun: e.tahun,
      rao: aiw[0].count,
      hoa: aikp[0].count,
    };
    return data;
  } catch (e) {
    
    throw new Error();
  }
};

const createPAT = async (request, reply) => {
  try {
    const { tahun } = request.body;
    const { pn, fullName, jabatan, role_kode, uka_kode } = request.user;
    const today = new Date().getFullYear();
    const uka = await sequelize.query(queries.uka, {
      bind: [uka_kode],
      type: QueryTypes.SELECT,
    });
    if(!uka[0]){
      return sendResponse(reply, 404, {
        status: "failed",
        message: "UKA tidak valid, tidak dapat melakukan Usulan PAT"
      })
    }
    const p = await pat.findOne({ where: { tahun, uka_kode } });
    if (p) {
      return forbidden(reply,`PAT ${uka[0].name} Tahun ${tahun} sudah ada`);
    }
    

    const createPAT = await pat.create({
      name: `PAT ${uka[0].name}`,
      tahun,
      uka_kode: uka[0].kode,
      uka_name: uka[0].name,
      status_pat: "On Progress",
      create_by: { pn: pn, nama: fullName, jabatan },
    });

    return created(reply, createPAT);
  } catch (e) {
    
    return internalServerError(reply, e);
  }
};

const findAllPAT = async (request, reply) => {
  try {
    const { nama, tahun, sortBy, page } = request.query;

    let file = [page * 12, (page - 1) * 12];
    let countFile = [];
    const str = `
    LIMIT $1
    OFFSET $2
    `;
    let filterBy = "";
    let countFilter = "";
    let n = 3;
    let c = 1;
    if (nama) {
      filterBy += ` WHERE name ~* $${n}`;
      countFilter += ` WHERE name ~* $${c}`;
      file.push(nama);
      countFile.push(nama);
      c++;
      n++;
    }
    let sort = "";
    if (sortBy) {
      sort = `
    ORDER BY ${sortBy}
    `;
    }
    const p = await sequelize.query(queries.filterPAT + filterBy + sort + str, {
      bind: file,
      type: QueryTypes.SELECT,
    });

    const countPAT = await sequelize.query(queries.filterPAT + countFilter, {
      bind: countFile,
      type: QueryTypes.SELECT,
    });
    const result = await Promise.all(p.map(async (e) => await countUKA(e)));

    let totalPage = Math.ceil(countPAT.length / 12);

    if (page < totalPage) {
      detailPage = {
        currentPage: Number(page),
        totalPage: totalPage,
        perPage: 12,
        previousPage: page - 1 == 0 ? null : page > 0 ? page - 1 : undefined,
        nextPage: page < totalPage ? Number(page) + 1 : undefined,
      };
    } else
      detailPage = {
        currentPage: Number(page),
        totalPage: totalPage,
        perPage: 12,
        previousPage: page - 1 == 0 ? null : page > 0 ? page - 1 : undefined,
        nextPage: page < totalPage ? Number(page) + 1 : null,
      };
    sendResponse(res, 200, { status: "success", statusCode: 200, data: result, detailPage });
  } catch (e) {
    
    return internalServerError(reply, e);
  }
};
const rejectRequestApproval = async (req, res) => {
  try {
    const { pat_id } = req.params

    const findRequest = await request_reset_pat.findOne({
      where: {
        pat_id: pat_id,
        status_persetujuan: "On Progress"
      }
    })

    if(!findRequest) return sendResponse(res, 404, { status: 'failed', message: 'not found request pat'})

    await pat.update(
      {
        status_pat: "Final",
      },
      {
        where: { id: pat_id },
      }
    )
    await request_reset_pat.destroy({
      where: {
        pat_id: pat_id,
        status_persetujuan: "On Progress"
      }
    })
    return sendResponse(res, 200, {
      status: "success",
      message: "berhasil reject request reset"
    })
    
  } catch (error) {
    return internalServerError(res, error);
  }
}

const postCreateRequest = async (req, res) => {
  try {
    const { pat_id } = req.params
    const { note } = req.body

    const findRequest = await request_reset_pat.findOne({
      where: {
        pat_id: pat_id,
        status_persetujuan: {
          [Op.ne]: "Final"
        }
      }
    })

    if(findRequest) return sendResponse(res, 404, { status: 'failed', message: 'request reset already send'})

    await pat.update(
      {
        status_pat: "Request Reset",
      },
      {
        where: { id: pat_id },
      }
    )
    await request_reset_pat.create({
      pat_id: pat_id,
      status_persetujuan: "On Progress",
      note,
      create_by: { pn: req.user.pn, fullName: req.user.fullName },
      update_by: { pn: req.user.pn, fullName: req.user.fullName },
    })

    return sendResponse(res, 200, {
      status: "success",
      message: "berhasil reject request reset"
    })
    
  } catch (error) {
    return internalServerError(res, error);
  }
}
module.exports = {
  createPAT,
  findAllPAT,
  rejectRequestApproval,
  postCreateRequest
};
