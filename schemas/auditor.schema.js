const auditorSchemaGet = {
  tags: ["PAT Auditor"],
  description: "Get PAT Auditor Projects",
  headers: {
    type: "object",
    properties: {
      Authorization: { type: "string" },
    },
  },
  querystring: {
    type: "object",
    properties: {
      page: { type: "number" },
      limit: { type: "number" },
    },
    required: ["limit", "page"],
  },
};

module.exports = {
  auditorSchemaGet,
};
