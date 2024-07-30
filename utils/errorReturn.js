const forbidden = (reply, message) => {
  return sendResponse(reply, 403, {
    status: "failed !",
    statusCode: 403,
    message: `${message}`,
  });
};

const updated = (reply, message) => {
  return sendResponse(reply, 200, {
    status: "success",
    statusCode: 200,
    message,
  });
};

const deleted = (reply, message) => {
  return sendResponse(reply, 200, {
    status: "success",
    statusCode: 200,
    message: `${message} berhasil di hapus !`,
  });
};

const found = (reply, data) => {
  return sendResponse(reply, 200, {
    status: "success",
    statusCode: 200,
    data,
  });
};

const success = (reply, message) => {
  return sendResponse(reply, 200, {
    status: "success",
    statusCode: 200,
    message: message,
  });
};

const notFound = (reply, file) => {
  return sendResponse(reply, 404, {
    status: "failed !",
    statusCode: 404,
    message: `${file} tidak ditemukan !`,
  });
};

const created = (reply, data) => {
  return sendResponse(reply, 201, {
    status: "success !",
    statusCode: 201,
    data,
  });
};

const internalServerError = (reply, e) => {
  return sendResponse(reply, 500, {
    status: "failed",
    statusCode: 500,
    message: "Internal Server Error",
    error: e,
  });
};

const badRequest = (reply, e) => {
  return sendResponse(reply, 400, {
    status: "failed",
    statusCode: 400,
    message: "Bad request",
    error: e,
  });
};

const loginFail = (reply) => {
  return sendResponse(reply, 200, {
    status: "failed",
    statusCode: 200,
    message: "Username dan Password Salah",
  });
};

const sendResponse = (res, code, data) => {
  const response = res.header("Strict-Transport-Security", "max-age=31536000; includeSubDomains")
  return response.code(code).send(data)
}


module.exports = {
  deleted,
  updated,
  found,
  notFound,
  forbidden,
  created,
  internalServerError,
  loginFail,
  badRequest,
  success,
  sendResponse,
};
