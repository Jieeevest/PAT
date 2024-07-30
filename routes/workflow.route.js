const {
  createWorkflow,
  approve,
  reject,
  findAllLogPersetujuan,
  findApproverAndSigners,
  reset,
  changeApprover,
} = require("../controllers/workflowController");
const { isLogin } = require("../hooks/authorize");

const resetOpt = {
  preHandler: isLogin,
  handler: reset,
};
const approveOpt = {
  preHandler: isLogin,
  handler: approve,
};
const rejectOpt = {
  preHandler: isLogin,
  handler: reject,
};
const createWorkflowOpt = {
  preHandler: isLogin,
  handler: createWorkflow,
};
const logOpt = {
  preHandler: isLogin,
  handler: findAllLogPersetujuan,
};
const approverAndSignersOpt = {
  preHandler: isLogin,
  handler: findApproverAndSigners,
};
const updateAprrover = {
  preHandler: isLogin,
  handler: changeApprover,
};

//
async function workflowRoute(fastify, options) {
  fastify.post("/workflow/reset", resetOpt);
  fastify.post("/workflow/approve", approveOpt);
  fastify.post("/workflow/reject", rejectOpt);
  fastify.post("/workflow/create", createWorkflowOpt);
  fastify.patch("/workflow", updateAprrover);
  fastify.get("/workflow/log", logOpt);
  fastify.get("/workflow", approverAndSignersOpt);
}

module.exports = workflowRoute;
