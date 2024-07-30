const {
  createTimAudit,
  showAllTimAudit,
  updateTimAudit,
  deleteTimAudit,
  showTimAuditById,
  findTimFromPAT,
  listTimAudit,
} = require("../controllers/timAuditController");
const { isLogin } = require("../hooks/authorize");
const { timAuditSchemaPost } = require("../schemas/tim.audit.schema");
const {
  authorizeAuditorAndSuperAdmin,
  authorizeAllExceptAdminUka,
} = require("../utils/validateByRole");

const createTimOpts = {
  schema: timAuditSchemaPost,
  preHandler: [isLogin, authorizeAuditorAndSuperAdmin],
  handler: createTimAudit,
};

const getAllTimOpts = {
  schema: {
    querystring: {
      type: "object",
      properties: {
        pat_id: { type: "string", minLength: 1 },
        page: { type: "integer" },
      },
      required: ["pat_id", "page"],
    },
  },
  preHandler: [isLogin, authorizeAuditorAndSuperAdmin],
  handler: showAllTimAudit,
};

const updateTimOpts = {
  preHandler: [isLogin, authorizeAuditorAndSuperAdmin],
  handler: updateTimAudit,
};

const getOneTimOpts = {
  schema: {
    querystring: {
      type: "object",
      properties: {
        pat_id: { type: "string", minLength: 1 },
        tim_id: { type: "string" },
      },
      required: ["pat_id", "tim_id"],
    },
  },
  preHandler: [isLogin, authorizeAuditorAndSuperAdmin],
  handler: showTimAuditById,
};

const deleteTimOpts = {
  schema: {
    querystring: {
      type: "object",
      properties: {
        pat_id: { type: "string", minLength: 1 },
        tim_id: { type: "string" },
      },
      required: ["pat_id", "tim_id"],
    },
  },
  preHandler: [isLogin, authorizeAuditorAndSuperAdmin],
  handler: deleteTimAudit,
};

const listTimOpts = {
  preHandler: [isLogin, authorizeAuditorAndSuperAdmin],
  handler: listTimAudit,
};
//
async function timAuditRoute(fastify, options) {
  fastify.post("/tim_audit/create", createTimOpts);
  fastify.get("/tim_audit/all", getAllTimOpts);
  fastify.patch("/tim_audit", updateTimOpts);
  fastify.delete("/tim_audit", deleteTimOpts);
  fastify.get("/tim_audit", getOneTimOpts);
  fastify.get("/tim_audit/list", listTimOpts);
}

module.exports = timAuditRoute;
