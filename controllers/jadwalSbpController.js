const {
	sequelize,
	jadwal_sbp,
	ref_penanggung_jawab,
	auditee_jadwal_sbp,
	ref_sub_kategori_anggaran,
	anggaran_kegiatan_sbp,
	anggaran_perjalanan_dinas_sbp,
} = require("../models");
const Sequelize = require("sequelize");
const { QueryTypes, Transaction, Op } = require("sequelize");
const { groupBy } = require("lodash");
const { findPATbyId } = require("../utils/PAT");
const { showTargetForJadwalSBP } = require("./targetAuditController");
const { internalServerError, sendResponse } = require("../utils/errorReturn");
const sbpQueries = {
	filterSBP: `
  SELECT DISTINCT s.id, s.pat_id,s.nama ,CAST(pic_maker_jadwal_sbp ->> 'nama' AS VARCHAR) as nama_pic,pj.pn as penanggung_jawab , pj.nama as nama_penanggung_jawab ,pj.jabatan as jabatan_penanggung_jawab,
  pelaksanaan_start,pelaksanaan_end,total_anggaran, CAST(ref_metode ->> 'nama' AS VARCHAR) as nama_metode, CAST(ref_tipe ->> 'nama' AS VARCHAR) as nama_tipe,  CAST(ref_jenis ->> 'nama' AS VARCHAR) as nama_jenis,  CAST(ref_tema ->> 'nama' AS VARCHAR) as nama_kategori
  FROM pat.jadwal_sbp s
  LEFT JOIN pat.ref_penanggung_jawab as pj ON pj.jadwal_sbp_id = s.id
  WHERE pat_id = $1
    `,
	lama_kegiatan: `
    SELECT DATE_PART('day',pelaksanaan_end-pelaksanaan_start) as date_diff
    FROM pat.jadwal_sbp as j
    WHERE j.id = $1
    `,
};

const getDays = async (id) => {
	// try {
	const days = await sequelize.query(sbpQueries.lama_kegiatan, {
		bind: [id],
		type: QueryTypes.SELECT,
	});
	return Number(days[0].date_diff);
	// } catch (e) {
	//   throw new Error();
	// }
};

const getJadwalSBP = async (pat_id) => {
	try {
		const r = await jadwal_sbp.findOne({
			where: {
				pat_id,
			},
			attributes: ["pic_maker_jadwal_sbp"],
		});
		return r;
	} catch (e) {
		throw new Error("Not Found ");
	}
};
const showAllJadwalSBP = async (req, res) => {
	try {
		const {
			pat_id,
			nama_sbp,
			ref_metode,
			ref_tipe,
			ref_jenis,
			ref_tema,
			pic,
			start_date,
			end_date,
			sortBy,
			page,
			limit,
		} = req.query;
		let { anggaran } = req.query;

		if (anggaran) {
			anggaran = anggaran.split(" ");
		}
		let sort = "";

		let detailPage;

		const filterOptions = {
			where: {
				pat_id,
			},
			include: [
				{
					model: ref_penanggung_jawab,
					where: {
						pn: {
							[Op.iLike]: `%${pic}%`,
						},
					},
					seperate: true,
				},
			],
		};

		if (nama_sbp) {
			filterOptions.where.nama = {
				[Op.iLike]: `%${nama_sbp}%`,
			};
		}
		if (ref_metode) {
			filterOptions.where.ref_metode = {
				kode: {
					[Op.iLike]: `%${ref_metode}%`,
				},
			};
		}
		if (ref_tipe) {
			filterOptions.where.ref_tipe = {
				kode: {
					[Op.iLike]: `%${ref_tipe}%`,
				},
			};
		}
		if (ref_jenis) {
			filterOptions.where.ref_jenis = {
				kode: {
					[Op.iLike]: `%${ref_jenis}%`,
				},
			};
		}
		if (ref_tema) {
			filterOptions.where.ref_tema = {
				kode: {
					[Op.iLike]: `%${ref_tema}%`,
				},
			};
		}
		if (start_date) {
			filterOptions.where.pelaksanaan_start = {
				[Op.gte]: start_date,
			};
		}

		if (end_date) {
			filterOptions.where.pelaksanaan_end = {
				[Op.lte]: end_date,
			};
		}

		if (anggaran) {
			filterOptions.where.total_anggaran = {
				[anggaran[0]]: Number(anggaran[1]),
			};
		}

		if (sortBy) {
			let seqSort = sortBy.split(" ");
			sort = [[seqSort[0], seqSort[1]]];
		}

		filterOptions.order = sort;
		filterOptions.limit = parseInt(limit);
		filterOptions.offset = parseInt(page - 1) * parseInt(limit);

		const sbpData = await jadwal_sbp.findAll(filterOptions);
		const count = await jadwal_sbp.count({
			where: filterOptions.where,
		});
		const totalPage = Math.ceil(parseInt(count) / limit);
		let totalData = parseInt(count) 

		if (sbpData.length === 0) {
			return sendResponse(res, 400, {
				status: "failed",
				statusCode: 400,
				message: "Jadwal Kegiatan tidak ditemukan",
			});
		}

		return sendResponse(res, 200, {
			status: "success",
			statusCode: 200,
			data: sbpData,
			pagination: {
				totalData
			},
		});
	} catch (e) {
		return sendResponse(res, 500, {
			status: "failed",
			message: "Internal server error!",
			error: e,
		});
	}
};
//   try {
//     const {
//       pat_id,
//       page,
//       nama_sbp,
//       ref_metode,
//       ref_tipe,
//       ref_jenis,
//       ref_tema,
//       pic,
//       start_date,
//       end_date,
//     } = req.query;
//     let { sortBy, limit } = req.query;
//     limit = limit ? limit : 9;
//     let { anggaran } = req.query;
//     if (anggaran) {
//       anggaran = anggaran.split(" ");
//     }
//     let sort = "";

//     const { uka_kode } = req.user;
//     const rex = /pska/gi;
//     let detailPage;
//     // const p = await findPATbyId(pat_id);
//     // if (p.uka_kode != uka_kode && uka_kode.match(rex) == null) {
//     //   return res
//     //     .code(403)
//     //     sendResponse(res, 500, ({ status: "failed", statusCode: 403, message: "Forbidden " });
//     // }

//     let file = [
//       pat_id,
//       parseInt(limit, 10),
//       (parseInt(page, 10) - 1) * parseInt(limit, 10),
//     ];
//     let countFile = [pat_id];
//     let countStr = "";
//     let filterBy = "";
//     let n = 4;
//     let c = 2;

//     if (sortBy) {
//       sort = `
//           ORDER BY ${sortBy}
//           `;
//     }
//     if (nama_sbp) {
//       filterBy += ` AND s.nama ~* $${n}`;
//       file.push(nama_sbp);
//       n++;
//       countStr += ` AND s.nama ~* $${c}`;
//       countFile.push(nama_sbp);
//       c++;
//     }
//     if (pic) {
//       filterBy += ` AND pj.pn ~* $${n}`;
//       file.push(pic);
//       n++;
//       countStr += ` AND pj.pn ~* $${c}`;
//       countFile.push(pic);
//       c++;
//     }
//     if (ref_metode) {
//       filterBy += ` AND ref_metode->> 'kode' ~* $${n}`;
//       file.push(ref_metode);
//       n++;
//       countStr += ` AND ref_metode ->> 'kode' ~* $${c}`;
//       countFile.push(ref_metode);
//       c++;
//     }
//     if (ref_tipe) {
//       filterBy += ` AND ref_tipe->> 'kode' ~* $${n}`;
//       file.push(ref_tipe);
//       n++;
//       countStr += ` AND ref_tipe ->> 'kode' ~* $${c}`;
//       countFile.push(ref_tipe);
//       c++;
//     }
//     if (ref_jenis) {
//       filterBy += ` AND ref_jenis->> 'kode' ~* $${n}`;
//       file.push(ref_jenis);
//       n++;
//       countStr += ` AND ref_jenis ->> 'kode' ~* $${c}`;
//       countFile.push(ref_jenis);
//       c++;
//     }
//     if (ref_tema) {
//       filterBy += ` AND ref_tema->> 'kode' ~* $${n}`;
//       file.push(ref_tema);
//       n++;
//       countStr += ` AND ref_tema ->> 'kode' ~* $${c}`;
//       countFile.push(ref_tema);
//       c++;
//     }
//     if (start_date) {
//       filterBy += ` AND pelaksanaan_start >= $${n}`;
//       file.push(start_date);
//       n++;
//       countStr += ` AND pelaksanaan_start >= $${c}`;
//       countFile.push(start_date);
//       c++;
//     }
//     if (end_date) {
//       filterBy += ` AND pelaksanaan_end <= $${n}`;
//       file.push(end_date);
//       n++;
//       countStr += ` AND pelaksanaan_end <= $${c}`;
//       countFile.push(end_date);
//       c++;
//     }
//     if (anggaran) {
//       filterBy += ` AND total_anggaran ${anggaran[0]} $${n}`;
//       file.push(Number(anggaran[1]));
//       n++;
//       countStr += ` AND total_anggaran ${anggaran[0]} $${c}`;
//       countFile.push(Number(anggaran[1]));
//       c++;
//     }

//     let str = `
//         LIMIT $2
//         OFFSET $3
//         `;
//     const filterSBP = await sequelize.query(
//       sbpQueries.filterSBP + filterBy + sort + str,
//       {
//         bind: file,
//         type: QueryTypes.SELECT,
//       }
//     );

//     const countSBP = await sequelize.query(sbpQueries.filterSBP + countStr, {
//       bind: countFile,
//       type: QueryTypes.SELECT,
//     });
//     // let dataReturn = [];
//     // let groupedData = groupBy(filterSBP, "id");
//     // for (const key in groupedData) {
//     //   dataReturn.push(groupedData[key][0]);
//     // }

//     let dataReturn = [];
//     let groupedData = groupBy(filterSBP, "id");
//     for (const key in groupedData) {
//       dataReturn.push(groupedData[key][0]);
//     }

//     const result = await Promise.all(
//       dataReturn.map(async (e) => await getSBP(e))
//     );
//     let totalPage = Math.ceil(countSBP.length / parseInt(limit, 10));
//     if (page < totalPage) {
//       detailPage = {
//         currentPage: Number(page),
//         totalPage: totalPage,
//         perPage: parseInt(limit, 10),
//         previousPage: page - 1 == 0 ? null : page > 0 ? page - 1 : undefined,
//         nextPage: page < totalPage ? Number(page) + 1 : undefined,
//       };
//     } else
//       detailPage = {
//         currentPage: Number(page),
//         totalPage: totalPage,
//         perPage: parseInt(limit, 10),
//         previousPage: page - 1 == 0 ? null : page > 0 ? page - 1 : undefined,
//         nextPage: page < totalPage ? Number(page) + 1 : null,
//       };
//     if (result.length == 0) {
//       return sendResponse(res, 400, {
//         status: "failed",
//         statusCode: 400,
//         message: "Jadwal Kegiatan tidak ditemukan ",
//       });
//     }
//     return res
//       .code(200)
//       sendResponse(res, 500, ({ status: "success", statusCode: 200, data: result, detailPage });
//   } catch (e) {
//     ;
//     return sendResponse(res, 500,{
//       status: "failed",
//       message: "Internal server error ! ",
//       error: e,
//     });
//   }
// };
const getSBP = async (e) => {
	try {
		const jadwalSBP = jadwal_sbp.findOne({
			where: { id: e.id },
			include: [
				{
					model: ref_penanggung_jawab,
				},
			],
		});
		return jadwalSBP;
	} catch (e) {
		;
		throw new Error();
	}
};
const getSBPDetails = async (id) => {
	try {
		const [jadwalSBP, pj, dinas, kegiatan, auditee] = await Promise.all([
			jadwal_sbp.findOne({ where: { id: id } }),
			ref_penanggung_jawab.findAll({ where: { jadwal_sbp_id: id } }),
			anggaran_perjalanan_dinas_sbp.findAll({ where: { jadwal_sbp_id: id } }),
			anggaran_kegiatan_sbp.findAll({ where: { jadwal_sbp_id: id } }),
			auditee_jadwal_sbp.findAll({ where: { jadwal_sbp_id: id } }),
		]);
		if (!jadwalSBP) {
			throw new Error("jadwal sbp tidak ditemukan ");
		}
		const data = {
			jadwal: jadwalSBP,
			penanggung_jawab: pj,
			anggaran_dinas: dinas,
			anggaran_kegiatan: kegiatan,
			auditee_jadwal_sbp: auditee,
		};
		return data;
	} catch (e) {
		;
		throw new Error();
	}
};
const showJadwalSBPDetails = async (req, res) => {
	try {
		const { pat_id, jadwal_sbp_id } = req.query;
		const { uka_kode } = req.user;
		const rex = /pska/gi;

		const data = await getSBPDetails(jadwal_sbp_id);
		return sendResponse(res, 200, {
			status: "success",
			data,
		  })
	} catch (e) {
		return internalServerError(res, e)
	}
};
const createJadwalSbp = async (request, reply) => {
	try {
		const { pn, fullName, uka_kode, jabatan, role_kode } = request.user;
		const {
			pat_id,
			ref_metode,
			ref_tipe,
			ref_jenis,
			ref_tema,
			penanggung_jawab,
			nama,
			deskripsi,
			uker,
			anggaran_kegiatan,
			anggaran_dinas,
		} = request.body;

		let { pelaksanaan_start, pelaksanaan_end } = request.body;
		const p = await findPATbyId(pat_id);
		if (!p) {
			return sendResponse(reply, 404, {
				status: "failed",
				statusCode: 404,
				message: "PAT tidak ditemukan ",
			});
		}
		const findJadwal = await jadwal_sbp.findOne({
			where: {
			  pat_id,
			  nama: {
				[Op.iLike]: nama
			  }
			}
		  })
	  
		  if(findJadwal){
			return sendResponse(res, 400, {
			  status: "failed",
			  message: "Jadwal sudah ada"
			})
		  }
		if (p.uka_kode != uka_kode && !role_kode.includes("1")) {
			return sendResponse(res, 500, { status: "failed", statusCode: 403, message: "Anda bukan UKA PAT" });
		}

		pelaksanaan_start = pelaksanaan_start.split("/").join("-");
		pelaksanaan_end = pelaksanaan_end.split("/").join("-");
		let jadwal;
		let total = 0;
		if (anggaran_dinas) {
			anggaran_dinas.forEach((e) => {
				total += Number(e.biaya_tiket_pp) || 0;
				total += Number(e.biaya_perjalanan_hari) || 0;
				total += Number(e.biaya_transport_lokal) || 0;
				total += Number(e.biaya_akomodasi) || 0;
			});
		}
		if (anggaran_kegiatan) {
			anggaran_kegiatan.forEach((e) => (total += Number(e.amount) || 0));
		}

		const result = await sequelize.transaction(
			// { isolationLevel: Transaction.ISOLATION_LEVELS.READ_COMMITTED },
			async (t) => {
				let branch = [];
				if (uker) {
					uker.forEach((e) => branch.push(e.ref_auditee_branch_kode.toString()));
				}

				jadwal = await jadwal_sbp.create(
					{
						pat_id,
						nama,
						count_target_jenis_auditee: null,
						ref_metode,
						ref_tipe,
						ref_jenis,
						ref_tema,
						deskripsi,
						total_anggaran: total,
						pelaksanaan_end,
						pelaksanaan_start,
						create_by: { pn, nama: fullName, jabatan },
						pic_maker_jadwal_sbp: { pn, nama: fullName, jabatan },
					},
					{ transaction: t }
				);

				if (uker) {
					uker.forEach((e) => {
						e["jadwal_sbp_id"] = jadwal.id;
						e["create_by"] = { pn, nama: fullName, jabatan };
					});
					await auditee_jadwal_sbp.bulkCreate(uker, {
						transaction: t,
					});
					jadwal.count_target_jenis_auditee = await showTargetForJadwalSBP(
						pat_id,
						p.uka_kode,
						jadwal.id,
						t // Pass the transaction to the showTargetForJadwalSBP function
					);
					await jadwal.save({ transaction: t });
				}
				if (penanggung_jawab) {
					penanggung_jawab.forEach((e) => {
						e["jadwal_sbp_id"] = jadwal.id;
						e["create_by"] = { pn, nama: fullName, jabatan };
						e["update_by"] = { pn, nama: fullName, jabatan };
					});
					await ref_penanggung_jawab.bulkCreate(penanggung_jawab, {
						transaction: t,
					});
				}
				const sub = await ref_sub_kategori_anggaran.findAll();
				await Promise.all(
					sub.map(async (e) => {
						await anggaran_kegiatan_sbp.create({
							jadwal_sbp_id: jadwal.id,
							ref_sub_kategori_anggaran_kode: {
								ref_sub_kategori_anggaran_kode: e.id,
								ref_sub_kategori_anggaran_name: e.nama,
							},
							amount: 0,
							create_by: { pn, nama: fullName, jabatan },
						});
					}),
					{ transaction: t }
				);

				if (penanggung_jawab) {
					await Promise.all(
						penanggung_jawab.map(async (e) => {
							await anggaran_perjalanan_dinas_sbp.create({
								pn_auditor: { pn: e.pn, nama: e.nama, jabatan: e.jabatan },
								jadwal_sbp_id: jadwal.id,
								biaya_perjalanan_hari: 0,
								biaya_tiket_pp: 0,
								biaya_transport_lokal: 0,
								biaya_akomodasi: 0,
								create_by: { pn, nama: fullName, jabatan },
							});
						})
					);
				}

				if (anggaran_dinas.length > 0) {
					await Promise.all(
						anggaran_dinas.map(async (e) => {
							await anggaran_perjalanan_dinas_sbp.update(
								{
									biaya_perjalanan_hari: e.biaya_perjalanan_hari,
									biaya_tiket_pp: e.biaya_tiket_pp,
									biaya_transport_lokal: e.biaya_transport_lokal,
									biaya_akomodasi: e.biaya_akomodasi,
								},
								{
									where: {
										"pn_auditor.pn": e.pn_auditor.pn,
										jadwal_sbp_id: jadwal.id,
									},
								}
							);
						}),
						{ transaction: t }
					);
				}

				if (anggaran_kegiatan.length > 0) {
					await Promise.all(
						anggaran_kegiatan.map(async (e) => {
							await anggaran_kegiatan_sbp.update(
								{ amount: e.amount },
								{
									where: {
										jadwal_sbp_id: jadwal.id,
										"ref_sub_kategori_anggaran_kode.ref_sub_kategori_anggaran_kode":
											e.ref_sub_kategori_anggaran_kode.ref_sub_kategori_anggaran_kode,
									},
								}
							);
						}),
						{ transaction: t }
					);
				}
			}
		);

		sendResponse(reply, 201, { status: "success", statusCode: 201, data: jadwal });
	} catch (e) {
		;
		return sendResponse(reply, 500, {
			status: "failed",
			message: "Internal server error ! ",
			error: e,
		});
	}
};
const updateSBP = async (
	uker,
	ref_metode,
	ref_tipe,
	ref_jenis,
	ref_tema,
	nama,
	pat_id,
	jadwal_sbp_id,
	penanggung_jawab,
	anggaran_dinas,
	anggaran_kegiatan,
	pelaksanaan_end,
	pelaksanaan_start,
	pn,
	jabatan,
	fullName
) => {
	// try {
	const p = await findPATbyId(pat_id);
	if (pelaksanaan_end) {
		pelaksanaan_end = pelaksanaan_end.split("/").join("-");
	}
	if (pelaksanaan_start) {
		pelaksanaan_start = pelaksanaan_start.split("/").join("-");
	}

	let num;
	let total = 0;
	if (anggaran_dinas) {
		anggaran_dinas.forEach((e) => {
			total += Number(e.biaya_tiket_pp) || 0;
			total += Number(e.biaya_perjalanan_hari) || 0;
			total += Number(e.biaya_transport_lokal) || 0;
			total += Number(e.biaya_akomodasi) || 0;
		});
	}
	if (anggaran_kegiatan) {
		anggaran_kegiatan.forEach((e) => (total += Number(e.amount) || 0));
	}

	const result = await sequelize.transaction(
		{ isolationLevel: Transaction.ISOLATION_LEVELS.READ_COMMITTED },
		async (t) => {
			await Promise.all([
				ref_penanggung_jawab.destroy({
					where: { jadwal_sbp_id },
				}),
				anggaran_perjalanan_dinas_sbp.destroy({
					where: { jadwal_sbp_id },
				}),
				anggaran_kegiatan_sbp.destroy({
					where: { jadwal_sbp_id },
				}),
				auditee_jadwal_sbp.destroy({
					where: { jadwal_sbp_id },
				}),
			]);
			if (penanggung_jawab) {
				penanggung_jawab.forEach((e) => {
					e["jadwal_sbp_id"] = jadwal_sbp_id;
					e["create_by"] = { pn, nama: fullName, jabatan };
					e["update_by"] = { pn, nama: fullName, jabatan };
				});
				await ref_penanggung_jawab.bulkCreate(penanggung_jawab, {
					transaction: t,
				});
			}
			const sub = await ref_sub_kategori_anggaran.findAll();
			await Promise.all(
				sub.map(async (e) => {
					await anggaran_kegiatan_sbp.create({
						jadwal_sbp_id: jadwal_sbp_id,
						ref_sub_kategori_anggaran_kode: {
							ref_sub_kategori_anggaran_kode: e.id,
							ref_sub_kategori_anggaran_name: e.nama,
						},
						amount: 0,
						create_by: { pn, nama: fullName, jabatan },
						update_by: { pn, nama: fullName, jabatan },
					});
				}),
				{ transaction: t }
			);
			if (uker) {
				uker.forEach((e) => {
					e["jadwal_sbp_id"] = jadwal_sbp_id;
					e["create_by"] = { pn, nama: fullName, jabatan };
				});
				await auditee_jadwal_sbp.bulkCreate(uker, {
					transaction: t,
				});
			}

			const target_audit = await showTargetForJadwalSBP(
				pat_id,
				p.uka_kode,
				jadwal_sbp_id,
				t
			);

			await jadwal_sbp.update(
				{
					ref_metode,
					ref_tipe,
					ref_jenis,
					ref_tema,
					nama,
					pat_id,
					count_target_jenis_auditee: target_audit,
					pelaksanaan_end,
					pelaksanaan_start,
					total_anggaran: total,
					update_by: { pn, nama: fullName, jabatan },
				},
				{ where: { id: jadwal_sbp_id } },
				{ transaction: t }
			);

			if (penanggung_jawab) {
				await Promise.all(
					penanggung_jawab.map(async (e) => {
						await anggaran_perjalanan_dinas_sbp.create({
							pn_auditor: { pn: e.pn, nama: e.nama, jabatan: e.jabatan },
							jadwal_sbp_id: jadwal_sbp_id,
							biaya_perjalanan_hari: 0,
							biaya_tiket_pp: 0,
							biaya_transport_lokal: 0,
							biaya_akomodasi: 0,
							create_by: { pn, nama: fullName, jabatan },
							update_by: { pn, nama: fullName, jabatan },
						});
					})
				);
			}

			if (anggaran_dinas) {
				await Promise.all(
					anggaran_dinas.map(async (e) => {
						await anggaran_perjalanan_dinas_sbp.update(
							{
								biaya_perjalanan_hari: e.biaya_perjalanan_hari,
								biaya_tiket_pp: e.biaya_tiket_pp,
								biaya_transport_lokal: e.biaya_transport_lokal,
								biaya_akomodasi: e.biaya_akomodasi,
								update_by: { pn, nama: fullName, jabatan },
							},
							{ where: { "pn_auditor.pn": e.pn_auditor.pn, jadwal_sbp_id } }
						);
					}),
					{ transaction: t }
				);
			}

			if (anggaran_kegiatan) {
				await Promise.all(
					anggaran_kegiatan.map(async (e) => {
						await anggaran_kegiatan_sbp.update(
							{
								amount: e.amount,
								update_by: { pn, nama: fullName, jabatan },
							},
							{
								where: {
									jadwal_sbp_id: jadwal_sbp_id,
									"ref_sub_kategori_anggaran_kode.ref_sub_kategori_anggaran_kode":
										e.ref_sub_kategori_anggaran_kode.ref_sub_kategori_anggaran_kode,
								},
							}
						);
					}),
					{ transaction: t }
				);
			}
		}
	);
	if (jadwal_sbp_id) {
		await anggaran_perjalanan_dinas_sbp.update(
			{ lama_kegiatan: await getDays(jadwal_sbp_id) },
			{ where: { jadwal_sbp_id } }
		);
	}
	return "Berhasil update jadwal";
	// } catch (e) {
	//   throw new Error();
	// }
};
const updateJadwalSBP = async (req, res) => {
	try {
		const { pn, jabatan, fullName } = req.user;
		const {
			nama,
			pat_id,
			jadwal_sbp_id,
			uker,
			penanggung_jawab,
			anggaran_dinas,
			anggaran_kegiatan,
			pelaksanaan_end,
			pelaksanaan_start,
			ref_metode,
			ref_tipe,
			ref_jenis,
			ref_tema,
		} = req.body;

		const findSBP = await jadwal_sbp.findByPk(jadwal_sbp_id);

		if (!findSBP)
			return sendResponse(res, 404, {
				status: "failed",
				statusCode: 404,
				message: "SBP tidak ditemukan ",
			});
		if (findSBP.pic_maker_jadwal_sbp.pn != pn) {
			return sendResponse(res, 403, {
				status: "failed",
				statusCode: 403,
				message: "Forbidden ",
			});
		}
		if(nama){
			const findJadwal = await jadwal_sbp.findOne({
				where: {
				  pat_id,
				  nama: {
					[Op.iLike]: nama
				  },
				  id: {
					[Op.ne]: jadwal_sbp_id
				  }
				}
			  })
		  
			  if(findJadwal){
				return sendResponse(res, 400, {
				  status: "failed",
				  message: "Jadwal sudah ada"
				})
			  }	
		}

		const jadwal = await updateSBP(
			uker,
			ref_metode,
			ref_tipe,
			ref_jenis,
			ref_tema,
			nama,
			pat_id,
			jadwal_sbp_id,
			penanggung_jawab,
			anggaran_dinas,
			anggaran_kegiatan,
			pelaksanaan_end,
			pelaksanaan_start,
			pn,
			jabatan,
			fullName
		);
		return sendResponse(res, 200, {
			status: "success",
			statusCode: 200,
			message: "Jadwal sbp berhasil di ubah ",
		  })
	} catch (e) {
		return sendResponse(res, 500,{
			status: "failed",
			statusCode: 500,
			message: "Internal server error ! ",
			error: e,
		});
	}
};
const deleteSBP = async (id) => {
	// try {
	const result = await sequelize.transaction(
		{ isolationLevel: Transaction.ISOLATION_LEVELS.READ_COMMITTED },
		async (t) => {
			await Promise.all([
				auditee_jadwal_sbp.destroy(
					{
						where: {
							jadwal_sbp_id: id,
						},
					},
					{ transaction: t }
				),
				ref_penanggung_jawab.destroy(
					{
						where: {
							jadwal_sbp_id: id,
						},
					},
					{ transaction: t }
				),
				anggaran_kegiatan_sbp.destroy(
					{
						where: {
							jadwal_sbp_id: id,
						},
					},
					{ transaction: t }
				),
				anggaran_perjalanan_dinas_sbp.destroy({
					where: {
						jadwal_sbp_id: id,
					},
				}),
			]);
			await jadwal_sbp.destroy(
				{
					where: {
						id,
					},
				},
				{ transaction: t }
			);
		}
	);
	return "SBP berhasil di hapus !";
	// } catch (e) {
	//   throw new Error();
	// }
};
const deleteJadwalSBP = async (req, res) => {
	try {
		const { jadwal_sbp_id } = req.query;
		const { pn, role_kode } = req.user;

		const jadwalSBP = await jadwal_sbp.findByPk(jadwal_sbp_id);
		if (!jadwalSBP)
			return sendResponse(res, 404, {
				status: "failed",
				statusCode: 404,
				message: "Jadwal Kegiatan tidak ditemukan",
			});
		if (jadwalSBP.pic_maker_jadwal_sbp.pn != pn && !role_kode.includes("1")){
			return sendResponse(res, 403, { status: "failed", statusCode: 403, message: "Forbidden" });
		}
		const jadwal = await deleteSBP(jadwal_sbp_id);
		return sendResponse(res, 200, {
			status: "success",
			statusCode: 200,
			message: jadwal,
		  })
	} catch (e) {
		
		return internalServerError(res, e)
	}
};

module.exports = {
	createJadwalSbp,
	showJadwalSBPDetails,
	deleteJadwalSBP,
	updateJadwalSBP,
	getJadwalSBP,
	showAllJadwalSBP,
};
