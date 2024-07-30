const { pat } = require("../models");

const ukaValidate = async (uka_pat, uka_user) => {
  try {
    if (uka_pat != uka_user) {
      return false;
    } else {
      return true;
    }
  } catch (e) {
    throw new Error();
  }
};

const statusValidate = async (pat_id) => {
  try {
    const pat_ = await pat.findOne({ where: { id: pat_id } });
    if (pat_.status_pat != "On Progress") {
      return false;
    } else return true;
  } catch (e) {
    throw new Error();
  }
};

const isSuperAdmin = (role_kode) => {
  try {
    if (role_kode.includes("1")) return true;
    else return false;
  } catch (e) {
    throw new Error();
  }
};

const isAdminUKA = (role_kode) => {
  try {
    if (role_kode.includes("6")) return true;
    else return false;
  } catch (e) {
    throw new Error();
  }
};
const isAdminPusat = (role_kode) => {
  try {
    if (role_kode.includes("2")) return true;
    else return false;
  } catch (e) {
    throw new Error();
  }
};

const isKAI = (role_kode) => {
  try {
    if (role_kode.includes("8")) return true;
    else return false;
  } catch (e) {
    throw new Error();
  }
};

module.exports = {
  isAdminPusat,
  isAdminUKA,
  ukaValidate,
  isSuperAdmin,
  statusValidate,
  isKAI,
};
