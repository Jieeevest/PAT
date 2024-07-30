const axios = require("axios");
// const logger = require("../utils/log4js");

const createNotif = async (bulkNotif) => {
  try {
    // console.log("sending notification...");
    const notif = await axios
      .post(`${process.env.COMMON_URL}/common/notifikasi/bulk`, {
        notif_bulk: bulkNotif,
      })
      .catch((e) => {
        // logger.error(`error when creating notification`, e);
        console.log("error when creating notification", e);
        return false;
      });
    // logger.info(`succes create notif`);
    return true;
  } catch (e) {
    // logger.error(`error bulk notif`, e);
    console.log("error bulk notif", e);
  }
};

module.exports = {
  createNotif,
};
