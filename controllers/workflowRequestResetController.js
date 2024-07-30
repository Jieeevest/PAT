const {
    sequelize,
    approvers_request_pat,
    signers,
    request_reset_pat_log_persetujuan,
    request_reset_pat,
    pat,
    document_pat,
  } = require("../models");
  const { createNotifikasi } = require("./notifikasiController");
  const { Transaction } = require("sequelize")
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
  
  const resetWorkflow = async (reset_pat_id) => {
    try {
      await Promise.all([
        request_reset_pat.update(
          {
            status_approver: null,
            status_persetujuan: "On Progress",
            initiator: null
          },
          {
            where: { id: reset_pat_id },
          }
        ),
        approvers_request_pat.destroy({ where: { reset_pat_id } }),
      ]);
      return "Success";
    } catch (err) {
      return err;
    }
  };
  
  const reset = async (req, res) => {
    try {
      const { reset_pat_id } = req.body;
      const p = await request_reset_pat.findByPk(reset_pat_id);
      if (req.user.pn !== p.initiator.pn) {
        return sendResponse(res, 403, {
          status: "failed",
          message: "anda bukan initiator",
        });
      }
  
      const reset = await resetWorkflow(reset_pat_id);
  
      return success(res, reset);
    } catch (err) {
      internalServerError(res, err);
    }
  };
  const changeApprover = async (req, res) => {
    try {
      const { reset_pat_id, approvers_request_pat: approver, } = req.body;
      const { eselon, pn, fullName, jabatan } = req.user;
      const p = await request_reset_pat.findByPk(reset_pat_id);
      if (pn !== p.initiator.pn) {
        return sendResponse(res, 403, {
          status: "failed",
          message: "anda bukan initiator pat",
        });
      }
      const newApprover = approver.filter((e) => e.is_signed != true);
      // destroy all
      await Promise.all([
        approvers_request_pat.destroy({
          where: { reset_pat_id, is_signed: { [Op.or]: [false, null] } },
        }),
      ]);
      newApprover.forEach((e) => {
        e["create_by"] = { pn, nama: fullName, jabatan };
        e["reset_pat_id"] = reset_pat_id;
        e["is_signed"] = null;
      });
      await sequelize.transaction(
        { isolationLevel: Transaction.ISOLATION_LEVELS.READ_COMMITTED },
        async (t) => {
          await approvers_request_pat.bulkCreate(newApprover, {
            transaction: t,
          });
          // await Promise.all(
          //   approvers_request_pat.map(async (e) => {
          //     await createNotifikasi(
          //       "PAT_COMMON",
          //       reset_pat_id,
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
          //       reset_pat_id,
          //       `Pending as Signer UKA ${p.name}`,
          //       `Approval Signer UKA ${p.name}`,
          //       { pn, nama: fullName, jabatan },
          //       { pn: e.pn, nama: e.nama, jabatan: e.jabatan }
          //     );
          //   }),
          //   { transaction: t }
          // );
        }
      );
  
      return success(res);
    } catch (err) {
      internalServerError(res, err);
    }
  };
  const findAllLogPersetujuan = async (req, res) => {
    try {
      const { reset_pat_id } = req.query;
      const { pn } = req.user;
      const log = await request_reset_pat_log_persetujuan.findAll({
        where: { reset_pat_id },
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
      const { reset_pat_id } = req.query;
      const p = await request_reset_pat.findOne({
        attributes: ["status_persetujuan", "status_approver"],
        where: { id: reset_pat_id },
        include: [
          {
            model: approvers_request_pat,
            where: { reset_pat_id },
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
    //   const doc = await document_request_reset_pat.findOne({
    //     where: { reset_pat_id },
    //   });
    //   if (!doc) {
    //     p.dataValues["status_document"] = "On Progress";
    //   } else {
    //     p.dataValues["status_document"] = doc.code_document;
    //   }
      return found(res, p);
    } catch (e) {
      return internalServerError(res, e);
    }
  };
  const createWorkflow = async (req, res) => {
    try {
      const { eselon, pn, fullName, jabatan } = req.user;
      const { reset_pat_id, approvers_request_pat: approver } = req.body;
      const p = await request_reset_pat.findByPk(reset_pat_id);
      if (!p) {
        return notFound(res, "PAT");
      }
      const num = p.riwayat_adendum;
      if (p.status_persetujuan != "On Progress") {
        // return forbidden(res);
        return sendResponse(res, 403, {
          message: "Forbidden!",
          info: "status On Progress",
        });
      }
      await resetWorkflow(reset_pat_id, 0);
      const mcsArr = [];
      const approverPN = [];
      let notIncludeSigners = [];
      approver.forEach((e) => {
        approverPN.push(e.pn);
        mcsArr.push(e.pn);
        e["create_by"] = { pn, nama: fullName, jabatan };
        e["reset_pat_id"] = reset_pat_id;
        e["is_signed"] = null;
      });
 
      await sequelize.transaction(
        { isolationLevel: Transaction.ISOLATION_LEVELS.READ_COMMITTED },
        async (t) => {
          try {
            await request_reset_pat.update(
              {
                status_persetujuan: "On Approver",
                status_approver: {
                  pn: approver[0].pn,
                  nama: approver[0].nama,
                },
              },
              { where: { id: reset_pat_id } },
              { transaction: t }
            );
            await approvers_request_pat.bulkCreate(approver, {
              transaction: t,
            });
            // await Promise.all(
            //   approvers_request_pat.map(async (e) => {
            //     await createNotifikasi(
            //       "PAT_COMMON",
            //       reset_pat_id,
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
            //       reset_pat_id,
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
            await request_reset_pat.update(
              { access: mcsArr },
              { where: { id: reset_pat_id } },
              { transaction: t }
            );
  
            createNotif([
                {
                  module: "PAT_REQUESTS_RESET",
                  module_id: reset_pat_id,
                  jenis: "Send Approval PAT Request Reset Doc",
                  perihal: `PAT Request Reset doc send approval by ${req.user.pn} - ${req.user.fullName}`,
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
  
            await request_reset_pat_log_persetujuan.create(
              {
                to: {},
                from: { pn, nama: fullName, jabatan },
                note: "Send Approval",
                is_approved: true,
                reset_pat_id,
                create_by: { pn, nama: fullName, jabatan },
              },
              { transaction: t }
            );
  
            return found(res, {
              maker: { pn, nama: fullName, jabatan },
              approvers_request_pat,
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
      const { reset_pat_id, note, data } = req.body;
  
      const p = await request_reset_pat.findByPk(reset_pat_id);
      if (!p) {
        return notFound(res, "PAT");
      }
  
  
      const status = p.status_approver;
      if ((status && status.pn !== pn) || p.status_persetujuan !== "On Approver") {
        return forbidden(
          res,
          "Anda bukan approver atau status PAT bukan On Approver"
        );
      }
  
      const transactionResult = await sequelize.transaction(async (t) => {
        const sp = await approvers_request_pat.findOne({
          where: {
            pn: pn.toString(),
            reset_pat_id,
            is_signed: null,
          },
          transaction: t,
        });
  
        if (!sp) {
          return forbidden(res, "Approver tidak valid");
        }

        await approvers_request_pat.update(
          { is_signed: true },
          { where: { id: sp.id }, transaction: t }
        );
  
        const findNextApprover = await approvers_request_pat.findAll({
          where: {
            reset_pat_id,
            is_signed: null,
          },
          order: [["createdAt", "DESC"]],
          transaction: t,
        });
  
        if (!findNextApprover.length) {
          await request_reset_pat.update(
            {
              status_approver: null,
              status_persetujuan: "Final",
              is_final: true,
            },
            { where: { id: reset_pat_id, }, transaction: t }
          );
          // let doc = {};
          // if (data) {
          //   doc = await generateDocument(data, "pat");
          // }
          // if (!doc) {
          //   throw new Error("Error When Creating Document");
          // } else {
          //   await document_request_reset_pat.create({
          //     reset_pat_id,
          //     dokumen: p.name,
          //     tanggal_document: new Date(),
          //   ,
          //     nama_lampiran: `${p.name}`,
          //     document_location: doc,
          //     document_status: "Success",
          //   });
          // }
  
          // Promise.all(
          //   approverrequest_reset_pat.map(async (e) => {
          //     await createNotifikasi(
          //       "PAT_COMMON",
          //       reset_pat_id,
          //       `${p.name} is Final`,
          //       `${p.name} is Final`,
          //       { pn, nama: fullName, jabatan },
          //       { pn: e.pn, nama: e.nama }
          //     );
          //   })
          // );
          // generateDocument(data).then((doc) => {
          //   document_request_reset_pat.update(
          //     {
          //       document_status: doc ? "Success" : "Failed",
          //       document_location: doc ? doc[0] : null,
          //     },
          //     { where: { id: docrequest_reset_pat.id }, transaction: t }
          //   );
          // });
        } else {
          await request_reset_pat.update(
            {
              status_approver: {
                pn: findNextApprover[0].pn,
                nama: findNextApprover[0].nama,
              },
            },
            { where: { id: reset_pat_id, }, transaction: t }
          );
        }
        // await Promise.all(
        //   approverrequest_reset_pat.map(async (e) => {
        //     await createNotifikasi(
        //       "PAT_COMMON",
        //       reset_pat_id,
        //       `Pending Approver ${p.name}`,
        //       `Approval ${p.name}`,
        //       { pn, nama: fullName, jabatan },
        //       { pn: e.pn, nama: e.nama }
        //     );
        //   })
        // );
        createNotif([
          {
            module: "PAT_REQUESTS_RESET",
            module_id: reset_pat_id,
            jenis: "Approval PAT Request Reset Doc",
            perihal: `PAT Request Reset doc approved by ${req.user.pn} - ${req.user.fullName}`,
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
        await request_reset_pat_log_persetujuan.create(
          {
            to: {},
            from: { pn, nama: fullName, jabatan },
            note,
            is_signed: true,
            reset_pat_id,
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
      const { reset_pat_id, note } = req.body;
      const p = await request_reset_pat.findByPk(reset_pat_id);
      if (!p) {
        return notFound(res, "PAT");
      }
  
      const approverPAT = await approvers_request_pat.findAll({
        where: { reset_pat_id },
      });
  
      const status = p.status_persetujuan;
      if (status != "On Approver") {
        return forbidden(res, "PAT bukan On Approver");
      }
      const result = await sequelize.transaction(
        // { isolationLevel: Transaction.ISOLATION_LEVELS.READ_UNCOMMITTED },
        async (t) => {
          const sp = await approvers_request_pat.findOne({
            where: { pn: pn.toString(), reset_pat_id, is_signed: null },
          });
          if (!sp) {
            return forbidden(res, "Approver tidak valid");
          }
          await request_reset_pat.update(
            {
              status_persetujuan: "On Progress",
              status_approver: null,
            },
            {
              where: {
                id: reset_pat_id,
              },
            }
          );
  
          await request_reset_pat_log_persetujuan.create(
            {
              to: {},
              from: { pn, nama: fullName, jabatan },
              note,
              is_signed: false,
              reset_pat_id,
              create_by: { pn, nama: fullName, jabatan },
            },
            { transaction: t }
          );
  
          const updateApprover = await approvers_request_pat.update(
            {
              is_signed: false,
            },
            {
              where: { reset_pat_id },
            }
          );
  
        //   await Promise.all(
        //     approverrequest_reset_pat.map(async (e) => {
        //       await createNotifikasi(
        //         "PAT_COMMON",
        //         reset_pat_id,
        //         `${p.name} has been rejected`,
        //         `${p.name} has been rejected`,
        //         { pn, nama: fullName, jabatan },
        //         { pn: e.pn, nama: e.nama }
        //       );
        //     })
        //   );
  
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
  