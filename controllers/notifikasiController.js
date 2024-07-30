const { pat_notification } = require("../models");
const { internalServerError, sendResponse } = require("../utils/errorReturn");
const axios = require("axios");
const getNotification = async (req, res) => {
  try {
    const { pn } = req.user;
    const { page } = req.query;
    const notif = await pat_notification.findAll({
      where: { "untuk.pn": pn },
      offset: (page - 1) * 6,
      limit: page * 6,
      order: [["createdAt", "DESC"]],
    });
    const pages = await pat_notification.count({
      where: { "untuk.pn": pn },
    });
    let totalPage = Math.ceil(pages / 6);
    if (page < totalPage) {
      detailPage = {
        currentPage: Number(page),
        totalPage: totalPage,
        perPage: 6,
        previousPage: page - 1 == 0 ? null : page > 0 ? page - 1 : undefined,
        nextPage: page < totalPage ? Number(page) + 1 : undefined,
      };
    } else
      detailPage = {
        currentPage: Number(page),
        totalPage: totalPage,
        perPage: 6,
        previousPage: page - 1 == 0 ? null : page > 0 ? page - 1 : undefined,
        nextPage: page < totalPage ? Number(page) + 1 : null,
      };

      return sendResponse(res, 200, {
        status: "success", statusCode: 200, data: notif, detailPage
      })
  } catch (e) {
    return internalServerError(res, e)
  }
};

const createNotification = async (
  pat_id,
  jenis,
  dari,
  untuk,
  perihal,
  adendum_no,
  is_adendum
) => {
  try {
    await pat_notification.create({
      pat_id,
      jenis,
      dari,
      untuk,
      perihal,
      read: false,
      adendum_no,
      is_adendum,
    });
    return true;
  } catch (e) {
    throw new Error();
  }
};
const createNotifikasi = async (
  module,
  module_id,
  jenis,
  perihal,
  user,
  penerima,
  url_path = null
) => {
  try {

    const notif = await axios
      .post(`${process.env.COMMON_SERVICE_HOST}/common/notifikasi`, {
        module,
        module_id,
        jenis,
        perihal,
        user,
        penerima,
        url_path,
      })
      .catch((e) => {
        return false;
      });
    return true;
  } catch (e) {
    throw new Error();
  }
};
const notificationDetail = async (req, res) => {
  try {
    const { id } = req.query;
    const notif = await pat_notification.findOne({ where: { id } });
    if (!notif.read) {
      await pat_notification.update({ read: true }, { where: { id } });
    }
    return sendResponse(res, 200, {
      status: "success", statusCode: 200, data: notif
    })
  } catch (e) {
    return internalServerError(res, e)
  }
};

const updateAllNotification = async (req, res) => {
  try {
    const { pn } = req.user;
    await pat_notification.update(
      { read: true },
      { where: { "untuk.pn": pn } }
    );
    return sendResponse(res, 200, {
      status: "success",
      statusCode: 200,
      message: "notification has been updated !",
    })
  } catch (e) {
    return internalServerError(res, e)
  }
};

const updateNotificationById = async (req, res) => {
  try {
    const { id } = req.query;
    
    await pat_notification.update({ read: true }, { where: { id } });
    return sendResponse(res, 200, {
      status: "success",
      statusCode: 200,
      message: "notification has been updated !",
    })

  } catch (e) {
    return internalServerError(res, e)
  }
};

module.exports = {
  getNotification,
  createNotification,
  notificationDetail,
  updateAllNotification,
  updateNotificationById,
  createNotifikasi,
};
