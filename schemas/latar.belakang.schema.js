const latarBelakangSchemaPost = {
  tags: ["PAT Latar Belakang"],
  description: "Post Latar Belakang",
  headers: {
    type: "object",
    properties: {
      Authorization: { type: "string" },
    },
  },
  body: {
    type: "object",
    required: ["latar_belakang", "pat_id"],
    properties: {
      latar_belakang: { type: "string" },
      pat_id: { type: "string" },
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

const latarBelakangSchemaGet = {
  tags: ["PAT Latar Belakang"],
  description: "PAT Get latar belakang",
  headers: {
    type: "object",
    properties: {
      Authorization: { type: "string" },
    },
  },
  querystring: {
    pat_id: { type: "string" },
  },
};

module.exports = {
  latarBelakangSchemaPost,
  latarBelakangSchemaGet,
};
