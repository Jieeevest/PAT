const {
  showAllPAT,
  showPATStatus,
} = require("../controllers/auditorController");
const { isLogin } = require("../hooks/authorize");
const { auditorSchemaGet } = require("../schemas/auditor.schema");

const postOptions = {
  schema: auditorSchemaGet,
  preHandler: isLogin,
  handler: showAllPAT,
};

const statusPAT = {
  preHandler: isLogin,
  handler: showPATStatus,
};

//
async function auditorRoute(fastify, options) {
  fastify.get("/auditors", postOptions);
  fastify.get("/auditors/:pat_id", statusPAT);
}

module.exports = auditorRoute;
