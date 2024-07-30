const {
  rejectRequestApproval,
  postCreateRequest,
} = require("../controllers/adminController");
const {
  createWorkflow,
  approve,
  reject,
  findAllLogPersetujuan,
  findApproverAndSigners,
  reset,
  changeApprover,
} = require("../controllers/workflowRequestResetController");

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
const rejectRequestOpts = {
  preHandler: isLogin,
  handler: rejectRequestApproval,
};
const createRequestOpts = {
  preHandler: isLogin,
  handler: postCreateRequest,
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
async function workflowResetRoute(fastify, options) {
  fastify.get("/request-reset/workflow/log", logOpt);
  fastify.get("/request-reset/workflow", approverAndSignersOpt);
  fastify.post("/request-reset/reject", rejectRequestOpts);
  fastify.post("/request-reset/create/:pat_id", createRequestOpts);
  fastify.post("/request-reset/workflow/reset", resetOpt);
  fastify.post("/request-reset/workflow/approve", approveOpt);
  fastify.post("/request-reset/workflow/reject", rejectOpt);
  fastify.post("/request-reset/workflow/create", createWorkflowOpt);
  fastify.patch("/request-reset/workflow", updateAprrover);
}

module.exports = workflowResetRoute;
