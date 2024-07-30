const detailsPage = (page, totalPage, limit) => {
  let detailPage;
  if (page < totalPage) {
    detailPage = {
      currentPage: Number(page),
      totalPage: totalPage,
      perPage: limit,
      previousPage: page - 1 == 0 ? null : page > 0 ? page - 1 : undefined,
      nextPage: page < totalPage ? Number(page) + 1 : undefined,
    };
  } else
    detailPage = {
      currentPage: Number(page),
      totalPage: totalPage,
      perPage: limit,
      previousPage: page - 1 == 0 ? null : page > 0 ? page - 1 : undefined,
      nextPage: page < totalPage ? Number(page) + 1 : null,
    };
  return detailPage;
};

module.exports = { detailsPage };
