// const router = require("express").Router();
// const { authorise } = require("../middlewares/authorize");
const {
  showLatarBelakangTujuan,
  showSumberInformasi,
  showTimAudit,
  showTargetAudit,
  showJadwalAudit,
  showJadwalSBP,
  showKegiatanLain,
  showAnggaran,
  downloadDocument,
  //   previewPdf,
  //   findAllDocument,
  //   generateDocumentWhenFail
} = require("../controllers/documentController");
const { isLogin } = require("../hooks/authorize");

const showLatarBelakang = {
  preHandler: isLogin,
  handler: showLatarBelakangTujuan,
};

const showTim = {
  preHandler: isLogin,
  handler: showTimAudit,
};
const showTarget = {
  preHandler: isLogin,
  handler: showTargetAudit,
};
const showJadwal = {
  preHandler: isLogin,
  handler: showJadwalAudit,
};
const showSBP = {
  preHandler: isLogin,
  handler: showJadwalSBP,
};
const showKegiatan = {
  preHandler: isLogin,
  handler: showKegiatanLain,
};
const showAnggaranInfo = {
  preHandler: isLogin,
  handler: showAnggaran,
};
//
async function documentRoute(fastify, options) {
  fastify.get("/document/ltb", showLatarBelakang);
  fastify.get("/document/si", showSumberInformasi);
  fastify.get("/document/tim_audit", showTim);
  fastify.get("/document/target_audit", showTarget);
  fastify.get("/document/jadwal_audit", showJadwal);
  fastify.get("/document/jadwal_sbp", showSBP);
  fastify.get("/document/kegiatan_lain", showKegiatan);
  fastify.get("/document/anggaran", showAnggaranInfo);
}

module.exports = documentRoute;
