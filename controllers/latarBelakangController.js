const { statusValidate, isSuperAdmin } = require("../utils/generalValidation");
const { findPATbyId } = require("../utils/PAT");
const { pat } = require("../models");
const { forbidden, success, found, sendResponse } = require("../utils/errorReturn");

const updateLatarBelakang = async (request, reply) => {
  const { latar_belakang, pat_id } = request.body;
  const { pn, fullName, uka_kode, jabatan, role_kode } = request.user;
  // try {
  const statusIsValid = await statusValidate(pat_id);
  if (!statusIsValid)
    sendResponse(reply, 403, { status: "failed", statusCode: 403, message: "Forbidden !" });
  const pat_ = await findPATbyId(pat_id);

  const PATHasPic = pat_.pic_latar_belakang_tujuan;
  const isPATPic =
    (PATHasPic && pat_.pic_latar_belakang_tujuan.pn == pn) ||
    isSuperAdmin(role_kode);
  if (isPATPic) {
    await pat.update(
      {
        latar_belakang,
        lb_updated_at: new Date(),
      },
      {
        where: {
          id: pat_id,
        },
      }
    );
  } else if (PATHasPic && pat_.pic_latar_belakang_tujuan.pn != pn) {
    return forbidden(reply, "Anda bukan PIC");
  } else if (!PATHasPic) {
    await pat.update(
      {
        latar_belakang,
        pic_latar_belakang_tujuan: { pn, nama: fullName, jabatan },
        lb_created_at: new Date(),
      },
      { where: { id: pat_id } }
    );
  }
  return success(reply, "success update latar belakang");
  // } catch (e) {
  //   return sendResponse(reply, 500, {
  //     status: "failed ",
  //     message: "Internal Server Error",
  //     error: e,
  //   });
  // }
};

const getLatarBelakang = async (request, reply) => {
  // try {
  const { pat_id } = request.query;
  const r = await findPATbyId(pat_id);

  const {
    latar_belakang,
    pic_latar_belakang_tujuan,
    lb_created_at,
    lb_updated_at,
  } = r;
  return found(reply, {
    latar_belakang,
    pic_latar_belakang_tujuan,
    lb_created_at,
    lb_updated_at,
  });
  // } catch (e) {
  //   return sendResponse(reply, 500, {
  //     status: "failed ",
  //     statusCode: 500,
  //     message: "Internal Server Error",
  //     error: e,
  //   });
  // }
};

module.exports = { getLatarBelakang, updateLatarBelakang };
