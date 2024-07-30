const { showTargetAudit } = require("../controllers/targetAuditController");
const { isLogin } = require("../hooks/authorize");

const getTargetAudit = {
  preHandler: isLogin,
  handler: showTargetAudit,
};

//
async function targetRoute(fastify, options) {
  fastify.get("/target/all", getTargetAudit);
}

module.exports = targetRoute;
