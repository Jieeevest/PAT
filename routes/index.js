const latarBelakangRoute = require("./latar.belakang.route");
const sumberInformasiRoute = require("./sumber.informasi.route");
const adminRoute = require("./admin.route");
const timAuditRoute = require("./tim.audit.route");
const auditorRoute = require("./auditor.route");
const sbpRoute = require("./jadwal.sbp.route");
const jadwalLainRoute = require("./jadwal.lain.route");
const jadwalAuditRoute = require("./jadwal.audit.route");
const approvalRoute = require("./approval.route");
const targetRoute = require("./target.audit.route");
const documentRoute = require("./document.route");
const commentRoute = require("./comment.route");
const kategoriAnggaranRoute = require("./kategori.anggaran.route");
const workflowRoute = require("./workflow.route");
const workflowResetRoute = require("./worflow.reset.route");

async function routes(fastify, options) {
  fastify.register(latarBelakangRoute);
  fastify.register(sumberInformasiRoute);
  fastify.register(adminRoute);
  fastify.register(timAuditRoute);
  fastify.register(auditorRoute);
  fastify.register(sbpRoute);
  fastify.register(jadwalLainRoute);
  fastify.register(jadwalAuditRoute);
  fastify.register(approvalRoute);
  fastify.register(targetRoute);
  fastify.register(documentRoute);
  fastify.register(commentRoute);
  fastify.register(kategoriAnggaranRoute);
  fastify.register(workflowRoute);
  fastify.register(workflowResetRoute);
  // fastify.register(loginRoutes, { prefix: "/login" })
}

module.exports = routes;
