const {
  showKategoriAnggaran,
} = require("../controllers/kategoriAnggaranController");
const { isLogin } = require("../hooks/authorize");

const getKategori = {
  preHandler: isLogin,
  handler: showKategoriAnggaran,
};

//
async function kategoriAnggaranRoute(fastify, options) {
  fastify.get("/ref_kategori_anggaran", getKategori);
}

module.exports = kategoriAnggaranRoute;
