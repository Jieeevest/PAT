const { findPATbyId } = require("../utils/PAT");
const { getJadwalAudit } = require("./jadwalAuditController");
const { getJadwalSBP } = require("./jadwalSbpController");
const { getTimAudit } = require("./timAuditController");
const { getJadwalLainnya } = require("./jadwalLainnyaController");
const { sequelize } = require("../models");
const { QueryTypes, Op } = require("sequelize");
const { internalServerError, notFound, sendResponse } = require("../utils/errorReturn");
const { adendum_pat, pat, approvers } = require("../models");

const showAllPAT = async (request, reply) => {
  try {
    const { pn, uka_kode, role_kode } = request.user;
    const {
      page = 1,
      limit = 9,
      project_name,
      tahun,
      status_approver,
      status_pat,
      sortBy,
    } = request.query;

    const isSuperAdmin = role_kode.includes("1");
    const isAdminPusat = role_kode.includes("2");
    const isAuditor = role_kode.includes("9");
    const isKAI = role_kode.includes("8");
    const isAdminUKA = role_kode.includes("6");

    const whereConditions = {};
    const attributes = [
      "id",
      ["name", "pat_name"],
      "tahun",
      "riwayat_adendum",
      "uka_kode",
      "uka_name",
      "status_pat",
      "status_approver",
    ];
    const includes = [
      {
        model: approvers,
      },
    ];
    if (project_name) {
      whereConditions.name = { [Op.iLike]: `%${project_name}%` };
    }
    if (tahun) {
      whereConditions.tahun = tahun;
    }
    if (status_pat) {
      whereConditions.status_pat = status_pat.replace("_", " ");
    }

    if (status_approver) {
      whereConditions.status_approver = {
        pn: status_approver,
      };
    }

    const options = {
      attributes,
      include: includes,
      where: whereConditions,
      order: sortBy ? [sortBy.split(" ")] : [],
      limit: limit ? parseInt(limit, 10) : 9,
      offset: (parseInt(page, 10) - 1) * parseInt(limit, 10),
    };

    let data;
    let totalCount;

    if (isSuperAdmin || isAdminPusat) {
      data = await pat.findAll(options);
      totalCount = await pat.count({ where: whereConditions });
    } else if (isAuditor || isKAI || isAdminUKA) {
      options.where = {
        [Op.or]: [{ uka_kode: uka_kode }],
        ...whereConditions,
      };
      data = await pat.findAll(options);
      totalCount = await pat.count({
        where: {
          [Op.or]: [{ uka_kode: uka_kode }],
          ...whereConditions,
        },
        include: includes,
      });
    }

    const detailPage = {
      totalData: totalCount
    };

    if (!data || data.length === 0) {
      return sendResponse(reply, 404, {
        status: "failed",
        statusCode: 404,
        messages: "PAT tidak ditemukan!",
        data: [],
      });
    }
    return sendResponse(reply, 200, {
      status: "success",
      statusCode: 200,
      messages: "PAT ditemukan!",
      data: data,
      pagination: detailPage,
    })
  } catch (e) {
    console.error(e);
    return internalServerError(reply, e);
  }
};

const showPATStatus = async (request, reply) => {
  try {
    const { pat_id } = request.params;
    const { uka_kode } = request.user;
    const p = await findPATbyId(pat_id);
    if (!p) {
      return notFound(reply, "PAT");
    }
    const [pic_jadwal_audit, pic_jadwal_sbp, pic_tim_audit, pic_kegiatan_lain] =
      await Promise.all([
        getJadwalAudit(pat_id),
        getJadwalSBP(pat_id),
        getTimAudit(pat_id),
        getJadwalLainnya(pat_id),
      ]);
    const {
      pic_latar_belakang_tujuan,
      pic_sumber_informasi,
      pn_maker_akhir,
      name,
      tahun,
      riwayat_adendum,
      uka_name,
      status_approver,
      create_by,
      createdAt,
      updatedAt
    } = p;

    let data = {
      pic_latar_belakang_tujuan,
      pic_sumber_informasi,
      pic_tim_audit,
      pic_jadwal_audit,
      pic_jadwal_sbp,
      pic_kegiatan_lain,
      pic_document: pn_maker_akhir,
      pat_name: name,
      tahun,
      riwayat_adendum,
      uka_kode: p.uka_kode,
      uka_name,
      status_approver,
      status_pat: p.status_pat,
      create_by,
      createdAt,
      updatedAt
    };
    return sendResponse(reply, 200, { status: "success", statusCode: 200, data })
  } catch (e) {
    return internalServerError(reply, e);
  }
};

module.exports = { showPATStatus, showAllPAT };
