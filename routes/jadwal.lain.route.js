const {
  createJadwalLainnya,
  showJadwalLainnyaDetails,
  showAllJadwalLainnya,
  updateJadwalLainnya,
  deleteJadwalLainnya,
} = require("../controllers/jadwalLainnyaController");
const { isLogin } = require("../hooks/authorize");

const createJadwalLain = {
  preHandler: isLogin,
  handler: createJadwalLainnya,
};

const getOneJadwalLain = {
  schema: {
    querystring: {
      type: "object",
      properties: {
        pat_id: { type: "string", minLength: 1 },
        kegiatan_lain_id: { type: "string", minLength: 1 },
      },
      required: ["pat_id", "kegiatan_lain_id"],
    },
  },
  preHandler: isLogin,
  handler: showJadwalLainnyaDetails,
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
  handler: showAllJadwalLainnya,
};

const updateSbp = {
  preHandler: isLogin,
  handler: updateJadwalLainnya,
};
const deleteSbp = {
  schema: {
    querystring: {
      type: "object",
      properties: {
        kegiatan_lain_id: { type: "string", minLength: 1 },
      },
      required: ["kegiatan_lain_id"],
    },
  },
  preHandler: isLogin,
  handler: deleteJadwalLainnya,
};
//
async function jadwalLainRoute(fastify, options) {
  fastify.post("/lain/create", createJadwalLain);
  fastify.get("/lain", getOneJadwalLain);
  fastify.get("/lain/all", getAllSbp);
  fastify.patch("/lain", updateSbp);
  fastify.delete("/lain", deleteSbp);
}

module.exports = jadwalLainRoute;
