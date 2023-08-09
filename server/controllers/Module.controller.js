const Models = require("../models");
const AppError = require("../utils/AppError");
const CatchAsync = require("../utils/CatchAsync");
const Helpers = require("../utils/Helpers");
const Paginate = require("../utils/Paginate");

module.exports.addModule = CatchAsync(async (req, res, next) => {
  const { title } = req.body.data;

  let newModule = await Models.Module.create({
    title: title,
  });

  newModule = Helpers.convertToPlainJSObject(newModule);

  return res.status(200).json({
    status: "success",
    message: "Module added successfully",
    data: {
      newModule,
    },
  });
});

module.exports.getModules = CatchAsync(async (req, res, next) => {
  const { query } = req;
  let whereCaluse = {
    deleted: false,
  };
  if (query.title) whereCaluse["title"] = query.title;
  const pagination = await Paginate(Models.Module, {}, query.page, query.limit);

  let modules = await Models.Module.findAll({
    where: whereCaluse,
    // attributes: { exclude: ["?", "?"] },
    order: [["createdAt", "desc"]],
    limit: pagination.limit,
    offset: pagination.offset,
  });

  return res.status(200).json({
    status: "success",
    message: "All modules fecthed successfully",
    data: {
      modules,
      pagination,
    },
  });
});

module.exports.updateModule = CatchAsync(async (req, res, next) => {
  const { id } = req.params;

  let checkModuleInDB = await Models.Module.findOne({
    where: { id, deleted: false },
  });

  if (!checkModuleInDB)
    return next(new AppError("Invalid ID. Module not found", 404));
  if (!req.body.data) {
    return res.status(424).json({
      status: "fail",
      message: "No Data is given to update the module",
    });
  }

  let [, [module]] = await Models.Module.update(
    { ...req.body.data },
    { where: { id }, returning: true }
  );

  module = Helpers.convertToPlainJSObject(module);

  return res.status(200).json({
    status: "success",
    message: "Module updated  successfully",
    data: {
      module,
    },
  });
});

module.exports.softDeleteModule = CatchAsync(async (req, res, next) => {
  const { id } = req.params;

  let checkModuleInDB = await Models.Module.findOne({
    where: { id, deleted: false },
  });

  if (!checkModuleInDB)
    return next(new AppError("Invalid ID. Module not found", 404));

  let [, [module]] = await Models.Module.update(
    { deleted: true },
    { where: { id }, returning: true }
  );

  return res.status(200).json({
    status: "success",
    message: "Module deleted (soft) successfully",
    data: {
      id,
    },
  });
});

module.exports.deleteModule = CatchAsync(async (req, res, next) => {
  const { id } = req.params;

  let checkModuleInDB = await Models.Module.findOne({
    where: { id, deleted: true },
  });

  if (!checkModuleInDB)
    return next(new AppError("Invalid ID. Module not found", 404));

  await Models.Module.destroy({ where: { id } });

  return res.status(200).json({
    status: "success",
    message: "Module deleted successfully",
    data: {
      id,
    },
  });
});
