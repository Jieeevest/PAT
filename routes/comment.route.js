const {
  createComment,
  updateStatusComment,
  getComment,
  totalComment,
} = require("../controllers/commentController");
const { isLogin } = require("../hooks/authorize");

const createCommentOpt = {
  schema: {
    body: {
      type: "object",
      properties: {
        parent_comment_id: { type: "integer" },
        pat_id: { type: "integer" },
        ref_bab_pat_kode: { type: "string" },
        deskripsi: { type: "string" },
      },
      required: ["pat_id", "ref_bab_pat_kode", "deskripsi"],
    },
  },
  preHandler: isLogin,
  handler: createComment,
};

const updateComment = {
  schema: {
    querystring: {
      type: "object",
      properties: {
        parent: { type: "integer" },
      },
      required: ["parent"],
    },
  },
  preHandler: isLogin,
  handler: updateStatusComment,
};

const getCommentOpts = {
  schema: {
    querystring: {
      type: "object",
      properties: {
        pat_id: { type: "string" },
        bab: { type: "integer" },
      },
    },
  },
  preHandler: isLogin,
  handler: getComment,
};
const totalOpts = {
  schema: {
    querystring: {
      type: "object",
      properties: {
        pat_id: { type: "string" },
      },
    },
  },
  preHandler: isLogin,
  handler: totalComment,
};

//
async function commentRoute(fastify, options) {
  fastify.post("/comment", createCommentOpt);
  fastify.patch("/comment", updateComment);
  fastify.get("/comment", getCommentOpts);
  fastify.get("/comment/total", totalOpts);
}

module.exports = commentRoute;
