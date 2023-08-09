const Models = require("../models");
const AppError = require("../utils/AppError");
const CatchAsync = require("../utils/CatchAsync");
const Helpers = require("../utils/Helpers");
const Paginate = require("../utils/Paginate");

module.exports.addDesignation = CatchAsync(async (req, res, next) => {
  const { title, roleId, canLead } = req.body.data;

  let checkRoleInDB = await Models.Role.findOne({
    where: { id: roleId, deleted: false },
  });

  if (!checkRoleInDB)
    return next(new AppError("Invalid ID. Role not found", 404));

  let designation = await Models.Designation.create({
    title: title,
    roleId: roleId,
    canLead,
  });

  designation = Helpers.convertToPlainJSObject(designation);

  return res.status(200).json({
    status: "success",
    message: "Designation added successfully",
    data: {
      designation,
    },
  });
});

module.exports.getdesignations = CatchAsync(async (req, res, next) => {
  const { query } = req;
  let whereData = {};
  if (query.roleId) whereData["roleId"] = query.roleId;

  const pagination = await Paginate(
    Models.Designation,
    whereData,
    query.page,
    query.limit
  );

  let designation = await Models.Designation.findAll({
    where: whereData,
    include: [{ model: Models.Role, as: "role", attributes: ["title"] }],
    order: [["createdAt", "desc"]],
    limit: pagination.limit,
    offset: pagination.offset,
  });

  return res.status(200).json({
    status: "success",
    message: "All Designations fecthed successfully",
    data: {
      designation,
      pagination,
    },
  });
});

module.exports.updateDesignation = CatchAsync(async (req, res, next) => {
  const { id } = req.params;

  let checkModuleInDB = await Models.Designation.findOne({
    where: { id },
  });

  if (!checkModuleInDB)
    return next(new AppError("Invalid ID. Designation not found", 404));
  if (!req.body.data) {
    return res.status(424).json({
      status: "fail",
      message: "No Data is given to update the Designation",
    });
  }

  let [, [designation]] = await Models.Designation.update(
    { ...req.body.data },
    { where: { id }, returning: true }
  );

  designation = Helpers.convertToPlainJSObject(designation);

  return res.status(200).json({
    status: "success",
    message: "Designation updated  successfully",
    data: {
      designation,
    },
  });
});

module.exports.softDeleteDesignation = CatchAsync(async (req, res, next) => {
  const { id } = req.params;

  let checkModuleInDB = await Models.Designation.findOne({
    where: { id },
  });

  if (!checkModuleInDB)
    return next(new AppError("Invalid ID. Designation not found", 404));

  await Models.Designation.destroy({ where: { id } });

  return res.status(200).json({
    status: "success",
    message: "Designation deleted (soft) successfully",
    data: {
      id,
    },
  });
});

module.exports.deleteDesignation = CatchAsync(async (req, res, next) => {
  const { id } = req.params;

  let checkModuleInDB = await Models.Designation.findOne({
    where: { id, deleted: true },
  });

  if (!checkModuleInDB)
    return next(new AppError("Invalid ID. Designation not found", 404));

  await Models.Designation.destroy({ where: { id } });

  return res.status(200).json({
    status: "success",
    message: "Designation deleted successfully",
    data: {
      id,
    },
  });
});
