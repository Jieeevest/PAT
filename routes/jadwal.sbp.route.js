const {
  createJadwalSbp,
  showJadwalSBPDetails,
  showAllJadwalSBP,
  updateJadwalSBP,
  deleteJadwalSBP,
} = require("../controllers/jadwalSbpController");
const { isLogin } = require("../hooks/authorize");

const createSbp = {
  preHandler: isLogin,
  handler: createJadwalSbp,
};

const getOneSbp = {
  schema: {
    querystring: {
      type: "object",
      properties: {
        pat_id: { type: "string", minLength: 1 },
        jadwal_sbp_id: { type: "string", minLength: 1 },
      },
      required: ["jadwal_sbp_id"],
    },
  },
  preHandler: isLogin,
  handler: showJadwalSBPDetails,
};

const getAllSbp = {
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
  handler: showAllJadwalSBP,
};

const updateSbp = {
  preHandler: isLogin,
  handler: updateJadwalSBP,
};
const deleteSbp = {
  schema: {
    querystring: {
      type: "object",
      properties: {
        jadwal_sbp_id: { type: "string", minLength: 1 },
      },
      required: ["jadwal_sbp_id"],
    },
  },
  preHandler: isLogin,
  handler: deleteJadwalSBP,
};
//
async function sbpRoute(fastify, options) {
  fastify.post("/sbp/create", createSbp);
  fastify.get("/sbp", getOneSbp);
  fastify.get("/sbp/all", getAllSbp);
  fastify.patch("/sbp", updateSbp);
  fastify.delete("/sbp", deleteSbp);
}

module.exports = sbpRoute;
