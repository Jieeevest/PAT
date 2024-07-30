const timAuditSchemaPost = {
  tags: ["PAT Tim Audit"],
  description: "Post Tim Audit",
  headers: {
    type: "object",
    properties: {
      Authorization: { type: "string" },
    },
  },
  body: {
    type: "object",
    required: [
      "pat_id",
      "name",
      "ref_tim_audit_ma",
      "ref_tim_audit_kta",
      "ref_tim_audit_ata",
    ],
    properties: {
      pat_id: { type: "string" },
      name: { type: "string" },
      ref_tim_audit_ma: { type: "array" },
      ref_tim_audit_kta: { type: "array" },
      ref_tim_audit_ata: { type: "array" },
    },
  },
};

const timAuditSchemaGet = {
  tags: ["PAT Tim Audit"],
  description: "PAT Get Tim Audit",
  headers: {
    type: "object",
    properties: {
      Authorization: { type: "string" },
    },
  },
  querystring: {
    pat_id: { type: "string" },
    page: { type: "number" },
  },
  response: {
    200: {
      type: "object",
      properties: {
        status: { type: "string" },
        statusCode: { type: "number" },
        data: {
          type: "object",
          properties: {
            sumber_informasi: { type: "string" },
            pic_latar_belakang_tujuan: { type: "string" },
            lb_created_at: { type: "string" },
            lb_updated_at: { type: "string" },
          },
        },
      },
    },
  },
};

module.exports = {
  timAuditSchemaPost,
  timAuditSchemaGet,
};
