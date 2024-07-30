const adminSchemaPost = {
  tags: ["PAT Create"],
  description: "Create Perencanaan Audit Tahunan",
  headers: {
    type: "object",
    properties: {
      Authorization: { type: "string" },
    },
  },
  body: {
    type: "object",
    required: ["tahun"],
    properties: {
      tahun: { type: "string" },
    },
  },
  response: {
    200: {
      type: "object",
      properties: {
        status: { type: "string" },
        statusCode: { type: "number" },
        message: { type: "string" },
      },
    },
    401: {
      type: "object",
      properties: {
        status: { type: "string" },
        statusCode: { type: "number" },
        message: { type: "string" },
      },
    },
    403: {
      type: "object",
      properties: {
        status: { type: "string" },
        statusCode: { type: "number" },
        message: { type: "string" },
      },
    },
  },
};

module.exports = {
  adminSchemaPost,
};
