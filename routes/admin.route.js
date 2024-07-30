const { createPAT, findAllPAT } = require("../controllers/adminController");
const { isLogin } = require("../hooks/authorize");
const { adminSchemaPost } = require("../schemas/admin.schema");

const postOptions = {
  schema: adminSchemaPost,
  preHandler: isLogin,
  handler: createPAT,
};
const getOptions = {
  preHandler: isLogin,
  handler: findAllPAT,
};

//
async function adminRoute(fastify, options) {
  fastify.post("/create", postOptions);
  fastify.get("/admin", getOptions);
}

module.exports = adminRoute;
