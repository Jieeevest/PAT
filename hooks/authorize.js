const { verify } = require("jsonwebtoken");
const { log_changes_user_skai, user_skai } = require("../models");
const { sendResponse } = require("../utils/errorReturn");

async function isLogin(request, reply) {
  let token;
  try {
    token = request.headers.authorization.split(" ")[1];
    if (!token) {
      return sendResponse(reply, 401, {
        status: "failed",
        message: "Not authorized , please Login ",
        error: error,
      });
    }

    const payload = verify(token, process.env.JWT_SECRET || "secret");
    request.user = payload;
    let logData = await log_changes_user_skai.findOne({
      where: { pn: request.user.pn },
    });

    if (logData) {
      let findSkai = await user_skai.findOne({
        where: { pn: request.user.pn },
      });

      findSkai = JSON.stringify(findSkai);
      logData = JSON.stringify(logData);

      if (findSkai != logData) {
        return sendResponse(reply, 401, {
          status: "failed",
          message: "Not authorized , please Login ",
          error: error,
        });
      } else {
        await log_changes_user_skai.destroy({
          where: { pn: request.user.pn },
        });
      }
    }
  } catch (err) {
    return sendResponse(reply, 401, {
      status: "failed",
      message: "Not authorized , please Login ",
      error: err,
    });
  }
}

function authorize(roles) {
  return (req, res, next) => {
    const { role_kode } = req.user;
    let canAccessByThisRole = false;
    roles.forEach((e) => {
      if (role_kode.includes(e)) {
        canAccessByThisRole = true;
      }
    });
    if (role_kode.includes("1")) {
      return next();
    }
    if (canAccessByThisRole) {
      return next();
    } else throw new Error(`This route is only for role ${roles} `);
  };
}

module.exports = { isLogin, authorize };
