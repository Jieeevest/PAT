const {
  sequelize,
  approvers,
  signers,
  log_persetujuan_pat,
  pat,
  document_pat,
} = require("../models");
const { createNotifikasi } = require("./notifikasiController");
const { Transaction } = require("sequelize");
const { findPATbyId } = require("../utils/PAT");
const { generateDocument } = require("./documentController");
const {
  internalServerError,
  forbidden,
  notFound,
  updated,
  found,
  success,
  sendResponse,
} = require("../utils/errorReturn");
const { createNotif } = require("../utils/notification");

const resetWorkflow = async (pat_id, adendum_no) => {
  try {
    await Promise.all([
      pat.update(
        {
          status_approver: null,
          status_pat: "On Progress",
        },
        {
          where: { id: pat_id },
        }
      ),
      approvers.destroy({ where: { pat_id, adendum_no } }),
      signers.destroy({ where: { pat_id, adendum_no } }),
    ]);
    return "Success";
  } catch (err) {
    return err;
  }
};

const reset = async (req, res) => {
  try {
    const { pat_id } = req.body;
    const p = await findPATbyId(pat_id);
    if (req.user.pn !== p.create_by.pn) {
      return sendResponse(res, 403, {
        status: "failed",
        message: "anda bukan initiator pat",
      });
    }

    const reset = await resetWorkflow(pat_id, p.riwayat_adendum);

    return success(res, reset);
  } catch (err) {
    internalServerError(res, err);
  }
};
const changeApprover = async (req, res) => {
  try {
    const { pat_id, approvers: approver, signers: signer } = req.body;
    const { eselon, pn, fullName, jabatan } = req.user;
    const p = await findPATbyId(pat_id);
    if (pn !== p.create_by.pn) {
      return sendResponse(res, 403, {
        status: "failed",
        message: "anda bukan initiator pat",
      });
    }
    const adendum_no = p.riwayat_adendum;
    const newApprover = approver.filter((e) => e.is_signed != true);
    // destroy all
    await Promise.all([
      approvers.destroy({
        where: { pat_id, is_signed: { [Op.or]: [false, null] }, adendum_no },
      }),
      signers.destroy({ where: { pat_id, adendum_no } }),
    ]);
    let notIncludeSigners = [];
    newApprover.forEach((e) => {
      e["create_by"] = { pn, nama: fullName, jabatan };
      e["pat_id"] = pat_id;
      e["is_signed"] = null;
      e["adendum_no"] = adendum_no;
    });

    signer.forEach((e) => {
      if (!approver.includes(e.pn)) {
        // return forbidden(res);
        notIncludeSigners.push(e.pn);
      }
      e["create_by"] = { pn, nama: fullName, jabatan };
      e["pat_id"] = pat_id;
      e["is_signed"] = null;
      e["adendum_no"] = adendum_no;
    });

    if (notIncludeSigners.length) {
      return sendResponse(res, 403, {
        status: "failed !",
        statusCode: 403,
        message: "Signers harus termasuk dalam approvers",
      });
    }
    await sequelize.transaction(
      { isolationLevel: Transaction.ISOLATION_LEVELS.READ_COMMITTED },
      async (t) => {
        await approvers.bulkCreate(newApprover, {
          transaction: t,
        });
        // await Promise.all(
        //   approvers.map(async (e) => {
        //     await createNotifikasi(
        //       "PAT_COMMON",
        //       pat_id,
        //       `Pending Approver ${p.name}`,
        //       { pn, nama: fullName, jabatan },
        //       { pn: e.pn, nama: e.nama, jabatan: e.jabatan }
        //     );
        //   }),

        //   { transaction: t }
        // );
        // await Promise.all(
        //   signers.map(async (e) => {
        //     await createNotifikasi(
        //       "PAT_COMMON",
        //       pat_id,
        //       `Pending as Signer UKA ${p.name}`,
        //       `Approval Signer UKA ${p.name}`,
        //       { pn, nama: fullName, jabatan },
        //       { pn: e.pn, nama: e.nama, jabatan: e.jabatan }
        //     );
        //   }),
        //   { transaction: t }
        // );

        await signers.bulkCreate(signer, {
          transaction: t,
        });
      }
    );

    return success(res);
  } catch (err) {
    internalServerError(res, err);
  }
};
const findAllLogPersetujuan = async (req, res) => {
  try {
    const { pat_id } = req.query;
    const { pn } = req.user;
    const log = await log_persetujuan_pat.findAll({
      where: { pat_id },
      attributes: {
        exclude: ["create_by", "update_by"],
      },
      order: [["createdAt", "DESC"]],
    });
    return found(res, { log });
  } catch (e) {
    return internalServerError(res, e);
  }
};
const findApproverAndSigners = async (req, res) => {
  try {
    const { pat_id } = req.query;
    const p = await pat.findOne({
      attributes: ["pn_maker_akhir", "status_pat", "status_approver"],
      where: { id: pat_id },
      include: [
        {
          model: approvers,
          where: { pat_id, adendum_no: 0 },
          attributes: {
            exclude: ["create_by", "update_by", "createdAt", "updatedAt"],
          },
          required: false,
        },
        {
          model: signers,
          where: { pat_id, adendum_no: 0 },
          attributes: {
            exclude: ["create_by", "update_by", "createdAt", "updatedAt"],
          },
          required: false,
        },
      ],
    });
    if (!p) {
      return notFound(res, "PAT");
    }
    const doc = await document_pat.findOne({
      where: { pat_id, adendum_no: 0 },
    });
    if (!doc) {
      p.dataValues["status_document"] = "On Progress";
    } else {
      p.dataValues["status_document"] = doc.code_document;
    }
    return found(res, p);
  } catch (e) {
    return internalServerError(res, e);
  }
};
const createWorkflow = async (req, res) => {
  try {
    const { eselon, pn, fullName, jabatan } = req.user;
    const { pat_id, approvers: approver, signers: signer } = req.body;
    const p = await findPATbyId(pat_id);
    if (!p) {
      return notFound(res, "PAT");
    }
    const num = p.riwayat_adendum;
    if (Number(eselon[1]) > 6 || p.status_pat != "On Progress") {
      // return forbidden(res);
      return sendResponse(res, 403, {
        message: "Forbidden!",
        info: "eselon > 6 and status On Progress",
      });
    }
    await resetWorkflow(pat_id, 0);
    const mcsArr = [];
    const approverPN = [];
    let notIncludeSigners = [];
    approver.forEach((e) => {
      approverPN.push(e.pn);
      mcsArr.push(e.pn);
      e["create_by"] = { pn, nama: fullName, jabatan };
      e["pat_id"] = pat_id;
      e["is_signed"] = null;
      e["adendum_no"] = num;
    });
    signer.forEach((e) => {
      mcsArr.push(e.pn);
      if (!approverPN.includes(e.pn)) {
        // return forbidden(res);
        notIncludeSigners.push(e.pn);
      }
      e["create_by"] = { pn, nama: fullName, jabatan };
      e["pat_id"] = pat_id;
      e["is_signed"] = null;
      e["adendum_no"] = num;
    });
    if (notIncludeSigners.length) {
      return sendResponse(res, 403, {
        status: "failed !",
        statusCode: 403,
        message: "Signers harus termasuk dalam approvers",
      });
    }
    await sequelize.transaction(
      { isolationLevel: Transaction.ISOLATION_LEVELS.READ_COMMITTED },
      async (t) => {
        try {
          await pat.update(
            {
              pn_maker_akhir: {
                pn,
                nama: fullName,
                eselon,
                jabatan,
              },
              status_pat: "On Approver",
              status_approver: {
                pn: approver[0].pn,
                nama: approver[0].nama,
              },
            },
            { where: { id: pat_id } },
            { transaction: t }
          );
          await approvers.bulkCreate(approver, {
            transaction: t,
          });
          // await Promise.all(
          //   approvers.map(async (e) => {
          //     await createNotifikasi(
          //       "PAT_COMMON",
          //       pat_id,
          //       `Pending Approver ${p.name}`,
          //       { pn, nama: fullName, jabatan },
          //       { pn: e.pn, nama: e.nama, jabatan: e.jabatan }
          //     );
          //   }),

          //   { transaction: t }
          // );
          // await Promise.all(
          //   signers.map(async (e) => {
          //     await createNotifikasi(
          //       "PAT_COMMON",
          //       pat_id,
          //       `Pending as Signer UKA ${p.name}`,
          //       `Approval Signer UKA ${p.name}`,
          //       { pn, nama: fullName, jabatan },
          //       { pn: e.pn, nama: e.nama, jabatan: e.jabatan }
          //     );
          //   }),
          //   { transaction: t }
          // );

          await signers.bulkCreate(signer, {
            transaction: t,
          });
          await pat.update(
            { access: mcsArr },
            { where: { id: pat_id } },
            { transaction: t }
          );

          createNotif([
            {
              module: "PAT_DOC",
              module_id: pat_id,
              jenis: "Approval PAT Doc",
              perihal: `PAT doc send approval by ${req.user.pn} - ${req.user.fullName}`,
              penerima: {
                pn: approver[0].pn,
                nama: approver[0].nama,
                jabatan: "",
              },
              user: {
                pn: req.user.pn,
                nama: req.user.fullName,
                jabatan: req.user.jabatan,
              },
              create_by: {
                pn: req.user.pn,
                nama: req.user.fullName,
                jabatan: req.user.jabatan,
              },
              url_path: req?.body?.url_path,
            },
          ]);

          await log_persetujuan_pat.create(
            {
              to: {},
              from: { pn, nama: fullName, jabatan },
              note: "Send Approval",
              is_approved: true,
              pat_id,
              create_by: { pn, nama: fullName, jabatan },
            },
            { transaction: t }
          );

          return found(res, {
            maker: { pn, nama: fullName, jabatan },
            approvers,
            signers,
          });
        } catch (err) {
          return sendResponse(res, 500, { message: err });
        }
      }
    );
  } catch (e) {
    return internalServerError(res, e);
  }
};
const approve = async (req, res) => {
  try {
    const { pn, fullName, jabatan } = req.user;
    const { pat_id, note, data } = req.body;

    const p = await findPATbyId(pat_id);
    if (!p) {
      return notFound(res, "PAT");
    }

    const approverPAT = await approvers.findAll({
      where: { pat_id, adendum_no: 0 },
    });

    const status = p.status_approver;
    if ((status && status.pn !== pn) || p.status_pat !== "On Approver") {
      return forbidden(
        res,
        "Anda bukan approver atau status PAT bukan On Approver"
      );
    }

    const transactionResult = await sequelize.transaction(async (t) => {
      const sp = await approvers.findOne({
        where: {
          pn: pn.toString(),
          pat_id,
          adendum_no: 0,
          is_signed: null,
        },
        transaction: t,
      });

      if (!sp) {
        return forbidden(res, "Approver tidak valid");
      }

      await approvers.update(
        { is_signed: true },
        { where: { id: sp.id, adendum_no: 0 }, transaction: t }
      );

      const findNextApprover = await approvers.findAll({
        where: {
          pat_id,
          is_signed: null,
        },
        order: [["createdAt", "DESC"]],
        transaction: t,
      });

      if (!findNextApprover.length) {
        await pat.update(
          {
            status_approver: null,
            status_pat: "Final",
            is_final: true,
          },
          { where: { id: pat_id, riwayat_adendum: 0 }, transaction: t }
        );
        // let doc = {};
        // if (data) {
        //   doc = await generateDocument(data, "pat");
        // }
        // if (!doc) {
        //   throw new Error("Error When Creating Document");
        // } else {
        //   await document_pat.create({
        //     pat_id,
        //     dokumen: p.name,
        //     tanggal_document: new Date(),
        //     adendum_no: 0,
        //     nama_lampiran: `${p.name}`,
        //     document_location: doc,
        //     document_status: "Success",
        //   });
        // }

        // Promise.all(
        //   approverPAT.map(async (e) => {
        //     await createNotifikasi(
        //       "PAT_COMMON",
        //       pat_id,
        //       `${p.name} is Final`,
        //       `${p.name} is Final`,
        //       { pn, nama: fullName, jabatan },
        //       { pn: e.pn, nama: e.nama }
        //     );
        //   })
        // );
        // generateDocument(data).then((doc) => {
        //   document_pat.update(
        //     {
        //       document_status: doc ? "Success" : "Failed",
        //       document_location: doc ? doc[0] : null,
        //     },
        //     { where: { id: docPat.id }, transaction: t }
        //   );
        // });
      } else {
        await pat.update(
          {
            status_approver: {
              pn: findNextApprover[0].pn,
              nama: findNextApprover[0].nama,
            },
          },
          { where: { id: pat_id, riwayat_adendum: 0 }, transaction: t }
        );
      }
      // await Promise.all(
      //   approverPAT.map(async (e) => {
      //     await createNotifikasi(
      //       "PAT_COMMON",
      //       pat_id,
      //       `Pending Approver ${p.name}`,
      //       `Approval ${p.name}`,
      //       { pn, nama: fullName, jabatan },
      //       { pn: e.pn, nama: e.nama }
      //     );
      //   })
      // );
      createNotif([
        {
          module: "PAT_DOC",
          module_id: pat_id,
          jenis: "Approval PAT Doc",
          perihal: `PAT doc approved by ${req.user.pn} - ${req.user.fullName}`,
          penerima: {
            pn: findNextApprover[0].pn,
            nama: findNextApprover[0].nama,
            jabatan: "",
          },
          user: {
            pn: req.user.pn,
            nama: req.user.fullName,
            jabatan: req.user.jabatan,
          },
          create_by: {
            pn: req.user.pn,
            nama: req.user.fullName,
            jabatan: req.user.jabatan,
          },
          url_path: req?.body?.url_path,
        },
      ]);
      await log_persetujuan_pat.create(
        {
          to: {},
          from: { pn, nama: fullName, jabatan },
          note,
          is_approved: true,
          pat_id,
          create_by: { pn, nama: fullName, jabatan },
        },
        { transaction: t }
      );

      return "Updated !"; // Return a value to transactionResult
    });

    return updated(res, transactionResult);
  } catch (e) {
    return internalServerError(res, e);
  }
};

const reject = async (req, res) => {
  try {
    const { pn, fullName, jabatan, role_kode } = req.user;
    const { pat_id, note } = req.body;
    const p = await findPATbyId(pat_id);
    if (!p) {
      return notFound(res, "PAT");
    }

    const approverPAT = await approvers.findAll({
      where: { pat_id, adendum_no: 0 },
    });

    const status = p.status_pat;
    if (status != "On Approver") {
      return forbidden(res, "PAT bukan On Approver");
    }
    const result = await sequelize.transaction(
      // { isolationLevel: Transaction.ISOLATION_LEVELS.READ_UNCOMMITTED },
      async (t) => {
        const sp = await approvers.findOne({
          where: { pn: pn.toString(), pat_id, adendum_no: 0, is_signed: null },
        });
        if (!sp) {
          return forbidden(res, "Approver tidak valid");
        }
        await pat.update(
          {
            pn_maker_akhir: null,
            status_pat: "On Progress",
            status_approver: null,
          },
          {
            where: {
              id: pat_id,
            },
          }
        );

        await log_persetujuan_pat.create(
          {
            to: {},
            from: { pn, nama: fullName, jabatan },
            note,
            is_approved: false,
            pat_id,
            create_by: { pn, nama: fullName, jabatan },
          },
          { transaction: t }
        );

        const updateApprover = await approvers.update(
          {
            is_signed: false,
          },
          {
            where: { pat_id, adendum_no: 0 },
          }
        );

        await Promise.all(
          approverPAT.map(async (e) => {
            await createNotifikasi(
              "PAT_COMMON",
              pat_id,
              `${p.name} has been rejected`,
              `${p.name} has been rejected`,
              { pn, nama: fullName, jabatan },
              { pn: e.pn, nama: e.nama }
            );
          })
        );

        return updated(res, "Rejected");
      }
    );
  } catch (e) {
    return internalServerError(res, e);
  }
};

module.exports = {
  findAllLogPersetujuan,
  findApproverAndSigners,
  createWorkflow,
  approve,
  reject,
  reset,
  changeApprover,
};
