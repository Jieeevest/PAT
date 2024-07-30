const { findPATbyId } = require("../utils/PAT");
const {
  forbidden,
  success,
  internalServerError,
  found,
} = require("../utils/errorReturn");

const updateSumberInformasi = async (request, reply) => {
  const { sumber_informasi, pat_id } = request.body;
  const { pn, fullName, uka_kode, jabatan, role_kode } = request.user;
  try {
    const pat = await findPATbyId(pat_id);
    if (pat.pat_status == "Final" || pat.pat_status == "On Adendum") {
      return forbidden(reply, "PAT sudah Final atau On Addendum");
    }
    // if (pat.uka != uka_kode && !role_kode.includes("1")) {
    //   return forbidden(reply);
    // }
    const PATHasPic = pat.pic_sumber_informasi;
    const isPATPic =
      (PATHasPic && pat.pic_sumber_informasi.pn == pn) ||
      role_kode.includes("1");
    const notPATPic = PATHasPic && pat.pic_sumber_informasi.pn != pn;
    if (isPATPic) {
      await pat.update(
        {
          sumber_informasi,
          si_updated_at: new Date(),
        },
        {
          where: {
            pat_id,
          },
        }
      );
    } else if (notPATPic) {
      forbidden(reply, "Anda bukan PIC");
    } else if (!PATHasPic) {
      await pat.update(
        {
          sumber_informasi,
          pic_sumber_informasi: { pn, nama: fullName, jabatan },
          si_created_at: new Date(),
        },
        {
          where: {
            pat_id,
          },
        }
      );
    }

    return success(reply, "success update sumber informasi");
  } catch (e) {
    ;
    internalServerError(reply, e.message);
  }
};

const getSumberInformasi = async (request, reply) => {
  try {
    const { pat_id } = request.query;
    const { uka_kode } = request.user;
    const rex = /pska/gi;
    const r = await findPATbyId(pat_id);
    // if (r.uka != uka_kode && uka_kode.match(rex) == null) {
    //   return forbidden(reply);
    // }
    const {
      sumber_informasi,
      pic_sumber_informasi,
      createdAt,
      updatedAt,
      si_created_at,
      si_updated_at,
    } = r;
    let data = {
      sumber_informasi,
      pic_sumber_informasi,
      si_created_at,
      si_updated_at,
    };
    return found(reply, data);
  } catch (e) {
    return internalServerError(reply, e.message);
  }
};

module.exports = { getSumberInformasi, updateSumberInformasi };
