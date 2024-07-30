const {
  createJadwalAudit,
  showAllJadwalAudit,
  showJadwalAuditByIdDetails,
  updateJadwalAudit,
  deleteJadwalAudit,
} = require("../controllers/jadwalAuditController");
const { isLogin } = require("../hooks/authorize");

const createJadwal = {
  preHandler: isLogin,
  handler: createJadwalAudit,
};

const getOneJadwal = {
  schema: {
    querystring: {
      type: "object",
      properties: {
        pat_id: { type: "string", minLength: 1 },
        jadwal_id: { type: "string", minLength: 1 },
      },
      required: ["jadwal_id"],
    },
  },
  preHandler: isLogin,
  handler: showJadwalAuditByIdDetails,
};

const getAllJadwal = {
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
  preHandler: isLogin,
  handler: showAllJadwalAudit,
};

const updateJadwal = {
  preHandler: isLogin,
  handler: updateJadwalAudit,
};
const deleteJadwal = {
  schema: {
    querystring: {
      type: "object",
      properties: {
        pat_id: { type: "string", minLength: 1 },
        jadwal_id: { type: "string", minLength: 1 },
      },
      required: ["pat_id", "jadwal_id"],
    },
  },
  preHandler: isLogin,
  handler: deleteJadwalAudit,
};
//
async function jadwalAuditRoute(fastify, options) {
  fastify.post("/audit/create", createJadwal);
  fastify.get("/audit", getOneJadwal);
  fastify.get("/audit/all", getAllJadwal);
  fastify.patch("/audit", updateJadwal);
  fastify.delete("/audit", deleteJadwal);
}

module.exports = jadwalAuditRoute;
