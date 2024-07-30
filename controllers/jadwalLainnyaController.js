const {
	sequelize,
	kegiatan_lain,
	ref_penanggung_jawab_kegiatan_lain,
	auditee_kegiatan_lain,
	ref_sub_kategori_anggaran,
	anggaran_kegiatan_lain,
	anggaran_perjalanan_dinas_lain,
} = require("../models");
const Sequelize = require("sequelize");
const { QueryTypes, Transaction, Op } = require("sequelize");
const { groupBy } = require("lodash");
const { findPATbyId } = require("../utils/PAT");
const { showTargetForJadwalLainnya } = require("./targetAuditController");
const { sendResponse } = require("../utils/errorReturn");
const sbpQueries = {
	filterKegiatanLain: `
    SELECT DISTINCT s.id, s.pat_id,s.nama,CAST(pic_maker_kegiatan_lain ->> 'nama' AS VARCHAR) as nama_pic,pj.pn as penanggung_jawab , pj.nama as nama_penanggung_jawab ,
    pelaksanaan_start,pelaksanaan_end,total_anggaran, CAST(ref_metode ->> 'nama' AS VARCHAR) as nama_metode, CAST(ref_tipe ->> 'nama' AS VARCHAR) as nama_tipe,  CAST(ref_jenis ->> 'nama' AS VARCHAR) as nama_jenis,  CAST(ref_tema ->> 'nama' AS VARCHAR) as nama_kategori
    FROM pat.kegiatan_lain s
    LEFT JOIN pat.ref_penanggung_jawab_kegiatan_lain as pj ON pj.kegiatan_lain_id = s.id
    WHERE pat_id = $1
      `,
	lama_kegiatan: `
      SELECT DATE_PART('day',pelaksanaan_end-pelaksanaan_start) as date_diff
      FROM pat.kegiatan_lain as j
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

const getJadwalLainnya = async (pat_id) => {
	try {
		const r = await kegiatan_lain.findOne({
			where: {
				pat_id,
			},
			attributes: ["pic_maker_kegiatan_lain"],
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

		if (parseInt(page) < totalPage) {
			detailPage = {
				currentPage: parseInt(page),
				totalPage: totalPage,
				perPage: limit,
				previousPage:
					parseInt(page) - 1 == 0
						? null
						: parseInt(page) > 0
						? parseInt(page) - 1
						: undefined,
				nextPage: parseInt(page) < totalPage ? Number(page) + 1 : undefined,
			};
		} else {
			detailPage = {
				currentPage: parseInt(page),
				totalPage: totalPage,
				perPage: limit,
				previousPage:
					parseInt(page) - 1 == 0
						? null
						: parseInt(page) > 0
						? parseInt(page) - 1
						: undefined,
				nextPage: parseInt(page) < totalPage ? Number(page) + 1 : null,
			};
		}

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
			detailPage,
		});
	} catch (e) {
		
		return sendResponse(res, 500, {
			status: "failed",
			message: "Internal server error!",
			error: e,
		});
	}
};
const showAllJadwalLainnya = async (req, res) => {
	try {
		const {
			pat_id,
			page,
			nama_kegiatan,
			ref_metode,
			ref_tipe,
			ref_jenis,
			ref_tema,
			pic,
			start_date,
			end_date,
		} = req.query;
		let { sortBy, limit } = req.query;
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
					model: ref_penanggung_jawab_kegiatan_lain,
					where: {
						pn: {
							[Op.iLike]: `%${pic}%`,
						},
					},
					seperate: true,
				},
			],
		};

		if (nama_kegiatan) {
			filterOptions.where.nama = {
				[Op.iLike]: `%${nama_kegiatan}%`,
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

		const sbpData = await kegiatan_lain.findAll(filterOptions);
		const countSBP = await kegiatan_lain.count({
			where: filterOptions.where,
		});


		let totalPage = Math.ceil(parseInt(countSBP) / parseInt(limit));
		let totalData = parseInt(countSBP)
		if (sbpData.length == 0) {
			return sendResponse(res, 400, {
				status: "failed",
				statusCode: 400,
				message: "Kegiatan Lain tidak ditemukan ",
			});
		}
		return sendResponse(res, 200, { status: "success", statusCode: 200, data: sbpData, pagination: { totalData } });
	} catch (e) {
		
		return sendResponse(res, 500,{
			status: "failed",
			message: "Internal server error ! ",
			error: e,
		});
	}
};
const getKegiatanLain = async (e) => {
	try {
		const kegiatanLain = kegiatan_lain.findOne({
			where: { id: e.id },
			include: [
				{
					model: ref_penanggung_jawab_kegiatan_lain,
				},
				{
					model: auditee_kegiatan_lain,
				},
			],
		});
		return kegiatanLain;
	} catch (e) {
		
		throw new Error();
	}
};
const getKegiatanLainDetails = async (id) => {
	try {
		const [kegiatanLain, pj, dinas, kegiatan, auditee] = await Promise.all([
			kegiatan_lain.findOne({ where: { id: id } }),
			ref_penanggung_jawab_kegiatan_lain.findAll({
				where: { kegiatan_lain_id: id },
			}),
			anggaran_perjalanan_dinas_lain.findAll({
				where: { kegiatan_lain_id: id },
			}),
			anggaran_kegiatan_lain.findAll({ where: { kegiatan_lain_id: id } }),
			auditee_kegiatan_lain.findAll({ where: { kegiatan_lain_id: id } }),
		]);
		if (!kegiatanLain) {
			throw new Error("jadwal kegiatan tidak ditemukan ");
		}
		const data = {
			jadwal: kegiatanLain,
			penanggung_jawab: pj,
			anggaran_dinas: dinas,
			anggaran_kegiatan: kegiatan,
			auditee_kegiatan_lain: auditee,
		};
		return data;
	} catch (e) {
		
		throw new Error();
	}
};
const showJadwalLainnyaDetails = async (req, res) => {
	try {
		const { pat_id, kegiatan_lain_id } = req.query;
		const { uka_kode } = req.user;
		const rex = /pska/gi;
		const p = await findPATbyId(pat_id);
		
		const data = await getKegiatanLainDetails(kegiatan_lain_id);
		return sendResponse(res, 200, {
			status: "success",
			data,
		  })
	} catch (e) {
		
		return sendResponse(res, 500,{
			status: "failed",
			message: "Internal server error ! ",
			error: e,
		});
	}
};
const createJadwalLainnya = async (request, reply) => {
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
				message: "PAT tidak ditemukan ! ",
			});
		}
		const findJadwal = await kegiatan_lain.findOne({
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
			return sendResponse(res, 403, { status: "failed", statusCode: 403, message: "Forbidden " })
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

				jadwal = await kegiatan_lain.create(
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
						pic_maker_kegiatan_lain: { pn, nama: fullName, jabatan },
					},
					{ transaction: t }
				);

				if (uker) {
					uker.forEach((e) => {
						e["kegiatan_lain_id"] = jadwal.id;
						e["create_by"] = { pn, nama: fullName, jabatan };
					});
					await auditee_kegiatan_lain.bulkCreate(uker, {
						transaction: t,
					});

					jadwal.count_target_jenis_auditee = await showTargetForJadwalLainnya(
						pat_id,
						p.uka_kode,
						jadwal.id,
						t // Pass the transaction to the showTargetForJadwalSBP function
					);
					await jadwal.save({ transaction: t });
				}
				if (penanggung_jawab) {
					penanggung_jawab.forEach((e) => {
						e["kegiatan_lain_id"] = jadwal.id;
						e["create_by"] = { pn, nama: fullName, jabatan };
						e["update_by"] = { pn, nama: fullName, jabatan };
					});
					await ref_penanggung_jawab_kegiatan_lain.bulkCreate(penanggung_jawab, {
						transaction: t,
					});
				}
				const sub = await ref_sub_kategori_anggaran.findAll();
				await Promise.all(
					sub.map(async (e) => {
						await anggaran_kegiatan_lain.create({
							kegiatan_lain_id: jadwal.id,
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
							await anggaran_perjalanan_dinas_lain.create({
								pn_auditor: { pn: e.pn, nama: e.nama, jabatan: e.jabatan },
								kegiatan_lain_id: jadwal.id,
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
							await anggaran_perjalanan_dinas_lain.update(
								{
									biaya_perjalanan_hari: e.biaya_perjalanan_hari,
									biaya_tiket_pp: e.biaya_tiket_pp,
									biaya_transport_lokal: e.biaya_transport_lokal,
									biaya_akomodasi: e.biaya_akomodasi,
								},
								{
									where: {
										"pn_auditor.pn": e.pn_auditor.pn,
										kegiatan_lain_id: jadwal.id,
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
							await anggaran_kegiatan_lain.update(
								{ amount: e.amount },
								{
									where: {
										kegiatan_lain_id: jadwal.id,
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
		
		return sendResponse(reply, 500, {
			status: "failed",
			message: "Internal server error ! ",
			error: e,
		});
	}
};
const updateJadwal = async (
	uker,
	ref_metode,
	ref_tipe,
	ref_jenis,
	ref_tema,
	nama,
	pat_id,
	kegiatan_lain_id,
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
				ref_penanggung_jawab_kegiatan_lain.destroy({
					where: { kegiatan_lain_id },
				}),
				anggaran_perjalanan_dinas_lain.destroy({
					where: { kegiatan_lain_id },
				}),
				anggaran_kegiatan_lain.destroy({
					where: { kegiatan_lain_id },
				}),
				auditee_kegiatan_lain.destroy({
					where: { kegiatan_lain_id },
				}),
			]);
			if (penanggung_jawab) {
				penanggung_jawab.forEach((e) => {
					e["kegiatan_lain_id"] = kegiatan_lain_id;
					e["create_by"] = { pn, nama: fullName, jabatan };
					e["update_by"] = { pn, nama: fullName, jabatan };
				});
				await ref_penanggung_jawab_kegiatan_lain.bulkCreate(penanggung_jawab, {
					transaction: t,
				});
			}
			const sub = await ref_sub_kategori_anggaran.findAll();
			await Promise.all(
				sub.map(async (e) => {
					await anggaran_kegiatan_lain.create({
						kegiatan_lain_id: kegiatan_lain_id,
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
					e["kegiatan_lain_id"] = kegiatan_lain_id;
					e["create_by"] = { pn, nama: fullName, jabatan };
				});
				await auditee_kegiatan_lain.bulkCreate(uker, {
					transaction: t,
				});
			}
			const target_audit = await showTargetForJadwalLainnya(
				pat_id,
				p.uka_kode,
				kegiatan_lain_id,
				t
			);

			await kegiatan_lain.update(
				{
					ref_metode,
					ref_tipe,
					ref_jenis,
					ref_tema,
					nama,
					pat_id,
					pelaksanaan_end,
					count_target_jenis_auditee: target_audit,
					pelaksanaan_start,
					total_anggaran: total,
					update_by: { pn, nama: fullName, jabatan },
				},
				{ where: { id: kegiatan_lain_id } },
				{ transaction: t }
			);

			if (penanggung_jawab) {
				await Promise.all(
					penanggung_jawab.map(async (e) => {
						await anggaran_perjalanan_dinas_lain.create({
							pn_auditor: { pn: e.pn, nama: e.nama, jabatan: e.jabatan },
							kegiatan_lain_id: kegiatan_lain_id,
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
						await anggaran_perjalanan_dinas_lain.update(
							{
								biaya_perjalanan_hari: e.biaya_perjalanan_hari,
								biaya_tiket_pp: e.biaya_tiket_pp,
								biaya_transport_lokal: e.biaya_transport_lokal,
								biaya_akomodasi: e.biaya_akomodasi,
								update_by: { pn, nama: fullName, jabatan },
							},
							{ where: { "pn_auditor.pn": e.pn_auditor.pn, kegiatan_lain_id } }
						);
					}),
					{ transaction: t }
				);
			}

			if (anggaran_kegiatan) {
				await Promise.all(
					anggaran_kegiatan.map(async (e) => {
						await anggaran_kegiatan_lain.update(
							{
								amount: e.amount,
								update_by: { pn, nama: fullName, jabatan },
							},
							{
								where: {
									kegiatan_lain_id: kegiatan_lain_id,
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
	if (kegiatan_lain_id) {
		await anggaran_perjalanan_dinas_lain.update(
			{ lama_kegiatan: await getDays(kegiatan_lain_id) },
			{ where: { kegiatan_lain_id } }
		);
	}
	return "Berhasil update jadwal";
	// } catch (e) {
	//   throw new Error();
	// }
};
const updateJadwalLainnya = async (req, res) => {
	try {
		const { pn, jabatan, fullName } = req.user;
		const {
			nama,
			pat_id,
			kegiatan_lain_id,
			penanggung_jawab,
			anggaran_dinas,
			anggaran_kegiatan,
			pelaksanaan_end,
			pelaksanaan_start,
			ref_metode,
			ref_tipe,
			ref_jenis,
			ref_tema,
			uker,
		} = req.body;

		const findKegiatan = await kegiatan_lain.findByPk(kegiatan_lain_id);

		if (!findKegiatan)
			return sendResponse(res, 404, {
				status: "failed",
				statusCode: 404,
				message: "Jadwal tidak ditemukan ",
			});
		if (findKegiatan.pic_maker_kegiatan_lain.pn != pn) {
			return sendResponse(res, 403, {
				status: "failed",
				statusCode: 403,
				message: "Forbidden ",
			});
		}
		if(nama){
			const findJadwal = await kegiatan_lain.findOne({
				where: {
				  pat_id,
				  nama: {
					[Op.iLike]: nama
				  },
				  id: {
					[Op.ne]: kegiatan_lain_id
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

		const jadwal = await updateJadwal(
			uker,
			ref_metode,
			ref_tipe,
			ref_jenis,
			ref_tema,
			nama,
			pat_id,
			kegiatan_lain_id,
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
			message: "Jadwal kegiatan berhasil di ubah ",
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
const deleteKegiatan = async (id) => {
	// try {
	const result = await sequelize.transaction(
		{ isolationLevel: Transaction.ISOLATION_LEVELS.READ_COMMITTED },
		async (t) => {
			await Promise.all([
				auditee_kegiatan_lain.destroy(
					{
						where: {
							kegiatan_lain_id: id,
						},
					},
					{ transaction: t }
				),
				ref_penanggung_jawab_kegiatan_lain.destroy(
					{
						where: {
							kegiatan_lain_id: id,
						},
					},
					{ transaction: t }
				),
				anggaran_kegiatan_lain.destroy(
					{
						where: {
							kegiatan_lain_id: id,
						},
					},
					{ transaction: t }
				),
				anggaran_perjalanan_dinas_lain.destroy({
					where: {
						kegiatan_lain_id: id,
					},
				}),
			]);
			await kegiatan_lain.destroy(
				{
					where: {
						id,
					},
				},
				{ transaction: t }
			);
		}
	);
	return "Jadwal Lain berhasil di hapus !";
	// } catch (e) {
	//   throw new Error();
	// }
};
const deleteJadwalLainnya = async (req, res) => {
	try {
		const { kegiatan_lain_id } = req.query;
		const { pn, role_kode } = req.user;

		const kegiatanLain = await kegiatan_lain.findByPk(kegiatan_lain_id);
		if (!kegiatanLain)
			return sendResponse(res, 404, {
				status: "failed",
				statusCode: 404,
				message: "Jadwal tidak ditemukan",
			});
		if (kegiatanLain.pic_maker_kegiatan_lain.pn != pn && !role_kode.includes("1")){
			return sendResponse(res, 200, { status: "failed", statusCode: 403, message: "Forbidden" });
		}
		const jadwal = await deleteKegiatan(kegiatan_lain_id);
		return sendResponse(res, 200, {
			status: "success",
			statusCode: 200,
			message: jadwal,
		  })
	} catch (e) {
		
		return sendResponse(res, 500,{
			status: "failed",
			message: "Internal server error ! ",
			error: e,
		});
	}
};

module.exports = {
	getKegiatanLain,
	createJadwalLainnya,
	showJadwalLainnyaDetails,
	deleteJadwalLainnya,
	updateJadwalLainnya,
	getJadwalLainnya,
	showAllJadwalLainnya,
};
