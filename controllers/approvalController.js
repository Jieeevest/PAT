const { stat } = require("fs");
const { Op } = require("sequelize");
const { approvers, log_persetujuan_pat, pat, sequelize } = require("../models");
const { detailsPage } = require("../utils/detailPage");
const { internalServerError, found, sendResponse } = require("../utils/errorReturn");
const getPAT = async (pat_id) => {
  try {
    const pat_ = await pat.findOne({
      attributes: ["name", "tahun"],
      where: { id: pat_id },
    });
    return pat_;
  } catch (e) {
    throw new Error();
  }
};
const getPATApproval = async (request, reply) => {
  try {
    const { pn } = request.user;

    const resultNewApproval = [];
    const approver = await approvers.findAll({
      where: { pn, is_signed: null, adendum_no: 0 },
    });
    // const approversAdendum = await checkers_uka.findAll({
    //   where: { pn, is_signed: false, adendum_no: { [Op.gt]: 0 } },
    // });
    // if (approversAdendum.length > 0) {
    //   await Promise.all(
    //     approversAdendum.map(async (e) => {
    //       const p = await getPAT(e.pat_id);
    //       e.dataValues["project_name"] = p.name;
    //       e.dataValues["tahun"] = p.tahun;
    //       e.dataValues["module"] = "Approval Document PAT Adendum";
    //       resultNewApproval.push(e);
    //     })
    //   );
    // }
    if (approver.length > 0) {
      await Promise.all(
        approver.map(async (e) => {
          const p = await getPAT(e.pat_id);
          e.dataValues["project_name"] = p.name;
          e.dataValues["tahun"] = p.tahun;
          e.dataValues["module"] = "Approval Document PAT";
          resultNewApproval.push(e);
        })
      );
    }
    // const reset = await reset_mcs.findAll({
    //   where: { status: "Waiting-For-Approval", "pic_approval.pn": pn },
    // });
    // if (reset.length > 0) {
    //   await Promise.all(
    //     reset.map(async (e) => {
    //       const p = await getPAT(e.pat_id);
    //       e.dataValues["project_name"] = p.name;
    //       e.dataValues["tahun"] = p.tahun;
    //       e.dataValues["module"] = "Approval Reset MCS";
    //       resultNewApproval.push(e);
    //     })
    //   );
    // }
    const logPATApprove = await log_persetujuan_pat.findAll({
      where: { is_approved: true, "from.pn": pn },
    });
    const logPATReject = await log_persetujuan_pat.findAll({
      where: { is_approved: false, "from.pn": pn },
    });
    // const logAdendumApprove = await log_persetujuan_adendum.findAll({
    //   where: { is_approved: true, "from.pn": pn },
    // });
    // const logAdendumReject = await log_persetujuan_adendum.findAll({
    //   where: { is_approved: false, "from.pn": pn },
    // });
    // const logResetApprove = await log_persetujuan_reset_mcs.findAll({
    //   where: { is_approved: true, "from.pn": pn },
    // });
    // const logAResetReject = await log_persetujuan_reset_mcs.findAll({
    //   where: { is_approved: false, "from.pn": pn },
    // });
    const totalApprove = logPATApprove.length;
    const totalReject = logPATReject.length;
    const newApproval = resultNewApproval.length;

    return sendResponse(reply, 200, {
      status: "success",
      statusCode: 200,
      data: {
        header: {
          totalApprove,
          totalReject,
          newApproval,
        },
        body: resultNewApproval,
      },
    })
  } catch (e) {
    
    return internalServerError(reply, e);
  }
};

const historyApproval = async (req, reply) => {
  try {
    let { page, name, tahun, status } = req.query;
    const { pn } = req.user;
    if (status) {
      if (status == "true") {
        status = true;
      } else {
        status = false;
      }
    } else {
      status = [true, false];
    }
    const logPAT = await log_persetujuan_pat.findAndCountAll({
      where: { "from.pn": pn, is_approved: status },
      include: [
        {
          model: pat,
          attributes: ["name", "tahun"],
          where: {
            [Op.and]: [
              sequelize.where(
                sequelize.cast(sequelize.col("pat.tahun"), "varchar"),
                { [Op.iRegexp]: tahun ? tahun : "" }
              ),
              { name: { [Op.iRegexp]: name ? name : "" } },
            ],
          },
        },
      ],
      limit: page * 9,
      offset: (page - 1) * 9,
    });
    // const logAdendum = await log_persetujuan_adendum.findAndCountAll({
    //   where: { "from.pn": pn },
    //   include: [
    //     {
    //       model: pat,
    //       attributes: ["name", "tahun"],
    //       where: { name: { [Op.iRegexp]: name ? name : "" } },
    //     },
    //   ],
    //   limit: page * 9,
    //   offset: (page - 1) * 9,
    // });
    // const logReset = await log_persetujuan_reset_mcs.findAndCountAll({
    //   where: { "from.pn": pn },
    //   include: [
    //     {
    //       model: pat,
    //       attributes: ["name", "tahun"],
    //       where: { name: { [Op.iRegexp]: name ? name : "" } },
    //     },
    //   ],
    //   limit: page * 9,
    //   offset: (page - 1) * 9,
    // });
    return found(reply, {
      logPAT: {
        data: logPAT.rows,
        detailPage: detailsPage(page, Math.ceil(logPAT.count / 9)),
      },
      //   logAdendum: {
      //     data: logAdendum.rows,
      //     detailPage: detailsPage(page, Math.ceil(logAdendum.count / 9)),
      //   },
      //   logReset: {
      //     data: logReset.rows,
      //     detailPage: detailsPage(page, Math.ceil(logReset.count / 9)),
      //   },
    });
  } catch (e) {
    
    return internalServerError(reply, e);
  }
};

module.exports = { getPATApproval, historyApproval };
