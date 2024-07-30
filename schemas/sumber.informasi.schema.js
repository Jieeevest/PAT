const sumberInformasiSchemaPost = {
  tags: ["PAT Sumber Informasi"],
  description: "Post Sumber Informasi",
  headers: {
    type: "object",
    properties: {
      Authorization: { type: "string" },
    },
  },
  body: {
    type: "object",
    required: ["sumber_informasi", "pat_id"],
    properties: {
      sumber_informasi: { type: "string" },
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

const sumberInformasiSchemaGet = {
  tags: ["PAT Sumber Informasi"],
  description: "PAT Get Sumber Informasi",
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
  sumberInformasiSchemaPost,
  sumberInformasiSchemaGet,
};
