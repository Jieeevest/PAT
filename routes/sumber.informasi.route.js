const {
  updateSumberInformasi,
  getSumberInformasi,
} = require("../controllers/sumberInformasiController");
const { isLogin } = require("../hooks/authorize");

const {
  sumberInformasiSchemaPost,
  sumberInformasiSchemaGet,
} = require("../schemas/sumber.informasi.schema");
const postOptions = {
  schema: sumberInformasiSchemaPost,
  preHandler: isLogin,
  handler: updateSumberInformasi,
};

const getLoginOpts = {
  schema: sumberInformasiSchemaGet,
  preHandler: isLogin,
  handler: getSumberInformasi,
};
//
async function sumberInformasiRoute(fastify, options) {
  fastify.post("/si", postOptions);
  fastify.get("/si", getLoginOpts);
}

module.exports = sumberInformasiRoute;
