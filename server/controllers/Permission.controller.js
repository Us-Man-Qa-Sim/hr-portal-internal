const Models = require("../models");
const AppError = require("../utils/AppError");
const CatchAsync = require("../utils/CatchAsync");
const Helpers = require("../utils/Helpers");
const Paginate = require("../utils/Paginate");

module.exports.addPermission = CatchAsync(async (req, res, next) => {
  const {
    moduleId,
    roleId,
    designationId,
    read,
    write,
    update,
    delete: del,
    self,
  } = req.body.data;

  let checkRoleInDB = await Models.Role.findOne({
    where: { id: roleId, deleted: false },
  });

  if (!checkRoleInDB)
    return next(new AppError("Invalid ID. Role not found", 404));

  if (designationId) {
    let checkModuleInDB = await Models.Designation.findOne({
      where: { id: designationId, deleted: false },
    });

    if (!checkModuleInDB)
      return next(new AppError("Invalid ID. Designation not found", 404));
  }

  let permission = await Models.Permission.create({
    moduleId: moduleId,
    read: read ? read : false,
    write: write ? write : false,
    update: update ? update : false,
    delete: del ? del : false,
    self: self ? self : false,
    roleId: roleId,
    designationId: designationId,
  });

  permission = Helpers.convertToPlainJSObject(permission);

  return res.status(200).json({
    status: "success",
    message: "Permission added successfully",
    data: {
      permission,
    },
  });
});

module.exports.getpermissions = CatchAsync(async (req, res, next) => {
  const { query } = req;

  let whereCaluse = { deleted: false };
  if (query.moduleId) whereCaluse["moduleId"] = query.moduleId;
  if (query.roleId) whereCaluse["roleId"] = query.roleId;
  if (query.designationId) whereCaluse["designationId"] = query.designationId;

  const pagination = await Paginate(
    Models.Permission,
    {},
    query.page,
    query.limit
  );
  let permissions = await Models.Permission.findAll({
    where: whereCaluse,
    attributes: { exclude: ["roleId", "designationId", "moduleId"] },
    include: [
      {
        model: Models.Role,
        // as: "permissionRole",
        attributes: ["id", "title"],
      },
      {
        model: Models.Module,
        //  as: "module",
        attributes: ["id", "title"],
      },
      {
        model: Models.Designation,
        // as: "designation",
        attributes: ["id", "title"],
      },
    ],
    order: [["createdAt", "desc"]],
    limit: pagination.limit,
    offset: pagination.offset,
  });

  permissions = permissions.map((item) => {
    return Helpers.convertToPlainJSObject(item);
  });

  return res.status(200).json({
    status: "success",
    message: "Permissions Fetched successfully",
    data: {
      permissions,
      pagination,
    },
  });
});

module.exports.softDeletePermission = CatchAsync(async (req, res, next) => {
  const { id } = req.params;

  let checkPermissionInDB = await Models.Permission.findOne({
    where: { id, deleted: false },
  });

  if (!checkPermissionInDB)
    return next(new AppError("Invalid ID. Permission not found", 404));

  let [, [permission]] = await Models.Permission.update(
    { deleted: true },
    { where: { id }, returning: true }
  );

  return res.status(200).json({
    status: "success",
    message: "Permission deleted (soft) successfully",
    data: {
      id,
    },
  });
});

module.exports.deletePermission = CatchAsync(async (req, res, next) => {
  const { id } = req.params;

  let checkPermissionInDB = await Models.Permission.findOne({
    where: { id, deleted: true },
  });

  if (!checkPermissionInDB)
    return next(new AppError("Invalid ID. Permission not found", 404));

  await Models.Permission.destroy({ where: { id } });

  return res.status(200).json({
    status: "success",
    message: "Permission deleted successfully",
    data: {
      id,
    },
  });
});

module.exports.updatePermission = CatchAsync(async (req, res, next) => {
  const { id } = req.params;

  let checkPermissionInDB = await Models.Permission.findOne({
    where: { id, deleted: false },
  });

  if (!checkPermissionInDB)
    return next(new AppError("Invalid ID. Permission not found", 404));
  if (!req.body.data) {
    return res.status(424).json({
      status: "fail",
      message: "No Data is given to update the Permission",
    });
  }

  let [, [permission]] = await Models.Permission.update(
    { ...req.body.data },
    { where: { id }, returning: true }
  );

  permission = Helpers.convertToPlainJSObject(permission);

  return res.status(200).json({
    status: "success",
    message: "Permission updated successfully",
    data: {
      permission,
    },
  });
});
