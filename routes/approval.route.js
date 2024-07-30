const {
  getPATApproval,
  historyApproval,
} = require("../controllers/approvalController");
const { isLogin } = require("../hooks/authorize");

const getApproval = {
  preHandler: isLogin,
  handler: getPATApproval,
};

const getHistoryApproval = {
  schema: {
    querystring: {
      type: "object",
      properties: {
        page: { type: "integer" },
        limit: { type: "integer" },
      },
      required: ["page", "limit"],
    },
  },
  preHandler: isLogin,
  handler: historyApproval,
};

//
async function approvalRoute(fastify, options) {
  fastify.get("/approval", getApproval);
  fastify.get("/approval/history", getHistoryApproval);
}

module.exports = approvalRoute;
