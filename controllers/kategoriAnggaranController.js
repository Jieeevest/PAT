const {
  ref_kategori_anggaran,
  ref_sub_kategori_anggaran,
} = require("../models");
const { internalServerError, sendResponse } = require("../utils/errorReturn");

const showKategoriAnggaran = async (req, res) => {
  try {
    const p = await ref_kategori_anggaran.findAll({
      where: { is_active: true },
      include: [
        {
          model: ref_sub_kategori_anggaran,
          attributes: ["id", "nama"],
          where: { is_active: true },
        },
      ],
      attributes: ["id", "nama"],
    });
    if (p.length == 0) {
      return sendResponse(res, 404, {
        status: "failed",
        statusCode: 404,
        message: "status ref tidak ditemukan !",
      });
    }
    return sendResponse(res, 200, {
      status: "success", statusCode: 200, data: p 
    })
  } catch (e) {
    return internalServerError(res, e)
  }
};

module.exports = {
  showKategoriAnggaran,
};
