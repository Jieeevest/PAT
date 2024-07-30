const { verify } = require("jsonwebtoken");
const { sendResponse } = require("../../../SUPPORT/utils/errorReturn");

module.exports = {
  isLogin: async (req, res, next) => {
    let token;
    try {
      token = req.headers.authorization.split(" ")[1];
      if (!token)
        return sendResponse(res, 401, {
          status: "failed",
          statusCode: 401,
          message: "Not authorized , please Login ",
          error: e,
        });
      const payload = verify(token, process.env.JWT_SECRET || "secret");
      req.user = payload;

      if (req.user) next();
      else throw new Error();
    } catch (e) {
      return sendResponse(res, 401, {
        status: "failed",
        statusCode: 401,
        message: "Not authorized , please Login ",
        error: e,
      });
    }
  },
  authorise: (roles) => {
    return (req, res, next) => {
      if (req.user.dataValues.roles == roles) next();
      else
        return sendResponse(res, 401, {
          status: "failed",
          statusCode: 401,
          message: `this route is only authorize for ${roles}`,
        });
    };
  },
};
