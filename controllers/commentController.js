const { comment, sequelize } = require("../models");
const { QueryTypes } = require("sequelize");
const _ = require("lodash");
const { sendResponse } = require("../utils/errorReturn");
const queries = {
  // CAST(create_by->>'pn' as VARCHAR) as pn_create_by,CAST(create_by->>'nama' as VARCHAR)as nama_create_by
  findComment: `
  WITH RECURSIVE comments AS(
    SELECT id, parent_comment_id ,pat_id,ref_bab_pat_kode,deskripsi,create_at,is_closed,
    CAST(create_by->>'pn' as VARCHAR) as pn_create_by,CAST(create_by->>'nama' as VARCHAR)as nama_create_by
	FROM pat.comment as cd
	WHERE id = $1
    UNION
    	SELECT c.id, c.parent_comment_id ,c.pat_id,c.ref_bab_pat_kode,c.deskripsi,c.create_at,c.is_closed,
      CAST(c.create_by->>'pn' as VARCHAR) as pn_create_by,CAST(c.create_by->>'nama' as VARCHAR)as nama_create_by
    FROM pat.comment c
		INNER JOIN comments as cs ON cs.id = c.parent_comment_id
) SELECT * FROM comments ORDER BY id ASC
  `,
  parent: `
  SELECT *
  FROM pat.comment
  WHERE pat_id = $1 AND ref_bab_pat_kode = $2 AND parent_comment_id is null
  `,
  allParentByPatId: `
  SELECT *
  FROM pat.comment
  WHERE pat_id = $1 AND parent_comment_id is null AND is_closed = false
  `,
};

const getChild = async (e) => {
  try {
    const data = await sequelize.query(queries.findComment, {
      bind: [e.id],
      type: QueryTypes.SELECT,
    });
    return data;
  } catch (e) {
    throw new Error();
  }
};

const createComment = async (req, res) => {
  try {
    const { parent_comment_id, pat_id, ref_bab_pat_kode, deskripsi } = req.body;
    const { pn, fullName, jabatan } = req.user;
    const comments = await comment.create({
      parent_comment_id,
      pat_id,
      ref_bab_pat_kode,
      deskripsi,
      create_by: { pn, nama: fullName, jabatan },
      update_by: { pn, nama: fullName, jabatan },
      is_closed: false,
    });
    sendResponse(res, 201, { status: "success", statusCode: 201, data: comments });
  } catch (e) {
    return sendResponse(res, 500,{
      status: "failed",
      message: "Internal server error ! ",
      error: e,
    });
  }
};
const updateStatusComment = async (req, res) => {
  try {
    const { parent } = req.query;

    const p = await comment.findByPk(parent);
    if (p.is_closed) {
      sendResponse(res, 403, { status: "failed", statusCode: 403, message: "Forbidden !" });
    }
    const c = await sequelize.query(queries.findComment, {
      bind: [parent],
      type: QueryTypes.SELECT,
    });
    if (c.length == 0) {
      return sendResponse(res, 404, {
        status: "failed",
        statusCode: 404,
        message: "Comment tidak ditemukan !",
      });
    }
    c.forEach(async (e) => {
      await comment.update({ is_closed: true }, { where: { id: e.id } });
    });
    return sendResponse(res, 200, {
      status: "success",
      statusCode: 200,
      message: "Comment is closed !",
    })

  } catch (e) {
    return sendResponse(res, 500,{
      status: "failed",
      message: "Internal server error ! ",
      error: e,
    });
  }
};
const findComment = async (pat_id, bab) => {
  try {
    const c = await sequelize.query(queries.parent, {
      bind: [pat_id, bab],
      type: QueryTypes.SELECT,
    });
    const comments = await Promise.all(c.map(async (e) => await getChild(e)));
    return comments;
  } catch (e) {
    throw new Error();
  }
};

const getComment = async (req, res) => {
  try {
    const { pat_id, bab } = req.query;
    const com = await findComment(pat_id, parseInt(bab));
    return sendResponse(res, 200, {
      status: "success",
      statusCode: 200,
      data: com,
    })
  } catch (error) {
    return sendResponse(res, 500,{
      status: "failed",
      message: "Internal server error ! ",
      error: e,
    });
  }
};
const totalComment = async (req, res) => {
  try {
    const { pat_id } = req.query;
    const com = await sequelize.query(queries.allParentByPatId, {
      bind: [pat_id],
      type: QueryTypes.SELECT,
    });
    let result = [];
    const groupCommentByBab = _.groupBy(com, "ref_bab_pat_kode");
    for (const key in groupCommentByBab) {
      let data = {
        ref_bab_pat_kode: groupCommentByBab[key][0].ref_bab_pat_kode,
        data: groupCommentByBab[key],
      };
      result.push(data);
    }
    let data = {};
    // const comments = await Promise.all(
    //   result.map(async (e) => await getChild(e))
    // );
    return sendResponse(res, 200, {
      status: "success",
      statusCode: 200,
      data: result,
    })

  } catch (error) {
    
    return sendResponse(res, 500,{
      status: "failed",
      message: "Internal server error ! ",
      error: error,
    });
  }
};

module.exports = {
  findComment,
  updateStatusComment,
  createComment,
  getComment,
  totalComment,
};
