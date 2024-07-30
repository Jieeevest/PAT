// const { userLogin, showUserProfile } = require("../controllers/userController");
const {
  updateLatarBelakang,
  getLatarBelakang,
} = require("../controllers/latarBelakangController");
const { isLogin } = require("../hooks/authorize");
const {
  latarBelakangSchemaPost,
  latarBelakangSchemaGet,
} = require("../schemas/latar.belakang.schema");
const postOptions = {
  schema: latarBelakangSchemaPost,
  preHandler: isLogin,
  handler: updateLatarBelakang,
};

const getLoginOpts = {
  schema: latarBelakangSchemaGet,
  preHandler: isLogin,
  handler: getLatarBelakang,
};
//
async function latarBelakangRoute(fastify, options) {
  fastify.post("/ltb", postOptions);
  fastify.get("/ltb", getLoginOpts);
}

module.exports = latarBelakangRoute;
