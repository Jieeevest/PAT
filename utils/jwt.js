const { sign, verify } = require("jsonwebtoken");

const secret = "secret";

const getToken = async (payload) => {
    return sign(payload, secret, { expiresIn: "2h" } );
}

const checkToken = async (token) => {
    return verify(token, secret);
}

module.exports = { getToken, checkToken };