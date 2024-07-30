const { authorize } = require("../hooks/authorize");

const authorizeAll = authorize(["1", "2", "6", "7", "8", "9"]);
const authorizeAllExceptAdminUka = authorize(["1", "2", "7", "8", "9"]);
const authorizeAuditorAndSuperAdmin = authorize(["1", "9"]);
const authorizeAdminPusatAndSuperAdmin = authorize(["1", "2"]);
const authorizeAdminUkaAndSuperAdmin = authorize(["1", "6"]);

module.exports = {
  authorizeAllExceptAdminUka,
  authorizeAuditorAndSuperAdmin,
  authorizeAdminPusatAndSuperAdmin,
  authorizeAdminUkaAndSuperAdmin,
  authorizeAll,
};
