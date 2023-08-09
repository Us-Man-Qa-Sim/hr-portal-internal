module.exports = async (model, condition, userPage, userLimit) => {
  const page = userPage ? parseInt(userPage) : 1;
  const total = await model.count({ where: condition });

  const limit = userLimit ? parseInt(userLimit) : parseInt(total);
  const offset = (page - 1) * limit;

  const nextPage = total / limit > page ? page + 1 : null;
  const prevPage = page <= 1 ? null : page - 1;
  const totalPages = Math.ceil(total / limit);

  return {
    limit,
    offset,
    nextPage,
    prevPage,
    totalRecords: total,
    totalPages,
    currentPage: page,
  };
};
