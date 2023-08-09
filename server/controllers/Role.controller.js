const Models = require("../models");
const AppError = require("../utils/AppError");
const CatchAsync = require("../utils/CatchAsync");
const Helpers = require("../utils/Helpers");
const Paginate = require("../utils/Paginate");

module.exports.addRole = CatchAsync(async (req, res, next) => {
  const { title } = req.body.data;

  let checkRoleInDB = await Models.Role.findOne({
    where: { title },
  });

  if (checkRoleInDB)
    return next(new AppError("Invalid ID. Role not found", 404));

  let role = await Models.Role.create({
    title: title,
  });

  role = Helpers.convertToPlainJSObject(role);

  return res.status(201).json({
    status: "success",
    message: "Role added successfully",
    data: {
      role,
    },
  });
});

module.exports.getRoles = CatchAsync(async (req, res, next) => {
  const { query } = req;

  const pagination = await Paginate(Models.Role, {}, query.page, query.limit);

  let roles = await Models.Role.findAll({
    where: {
      deleted: false,
    },
    // attributes: { exclude: ["?", "?"] },
    order: [["createdAt", "desc"]],
    limit: pagination.limit,
    offset: pagination.offset,
  });

  return res.status(200).json({
    status: "success",
    message: "All roles fecthed successfully",
    data: {
      roles,
      pagination,
    },
  });
});

module.exports.updateRole = CatchAsync(async (req, res, next) => {
  const { id } = req.params;

  let checkRoleInDB = await Models.Role.findOne({
    where: { id, deleted: false },
  });

  if (!checkRoleInDB)
    return next(new AppError("Invalid ID. Role not found", 404));
  if (!req.body.data) {
    return res.status(424).json({
      status: "fail",
      message: "No Data is given to update the Role",
    });
  }

  let [, [role]] = await Models.Role.update(
    { ...req.body.data },
    { where: { id }, returning: true }
  );

  role = Helpers.convertToPlainJSObject(role);

  return res.status(200).json({
    status: "success",
    message: "Role updated successfully",
    data: {
      role,
    },
  });
});

module.exports.softDeleteRole = CatchAsync(async (req, res, next) => {
  const { id } = req.params;

  let checkRoleInDB = await Models.Role.findOne({
    where: { id, deleted: false },
  });

  if (!checkRoleInDB)
    return next(new AppError("Invalid ID. Role not found", 404));

  let [, [role]] = await Models.Role.update(
    { deleted: true },
    { where: { id }, returning: true }
  );

  return res.status(200).json({
    status: "success",
    message: "Role deleted (soft) successfully",
    data: {
      id,
    },
  });
});

module.exports.deleteRole = CatchAsync(async (req, res, next) => {
  const { id } = req.params;

  let checkRoleInDB = await Models.Role.findOne({
    where: { id, deleted: true },
  });

  if (!checkRoleInDB)
    return next(new AppError("Invalid ID. Role not found", 404));

  await Models.Role.destroy({ where: { id } });

  return res.status(200).json({
    status: "success",
    message: "Role deleted successfully",
    data: {
      id,
    },
  });
});
