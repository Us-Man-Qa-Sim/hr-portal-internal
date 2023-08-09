const Models = require("../models");
const AppError = require("../utils/AppError");
const CatchAsync = require("../utils/CatchAsync");
const Helpers = require("../utils/Helpers");
const Paginate = require("../utils/Paginate");

module.exports.addDepartment = CatchAsync(async (req, res, next) => {
  const { title } = req.body.data;

  let department = await Models.Department.create({
    title: title,
  });

  department = Helpers.convertToPlainJSObject(department);

  return res.status(201).json({
    status: "success",
    message: "Department added successfully",
    data: {
      department,
    },
  });
});

module.exports.deleteDepartment = CatchAsync(async (req, res, next) => {
  const { id } = req.params;

  const checkDepartmentInDB = await Models.Department.findOne({
    where: { id },
  });
  if (!checkDepartmentInDB)
    return next(new AppError("Invalid ID. Department not found", 404));

  const checkDeletedDepartmentInDB = await Models.Department.findOne({
    where: { id, deleted: true },
  });
  if (checkDeletedDepartmentInDB)
    return next(new AppError("Invalid ID. Department not found", 404));

  let [, [department]] = await Models.Department.update(
    { deleted: true },
    { where: { id }, returning: true }
  );
  return res.status(200).json({
    status: "success",
    message: "Department deleted successfully",
    data: {
      departmentId: id,
    },
  });
});

module.exports.getDepartments = CatchAsync(async (req, res, next) => {
  const { query } = req;

  const pagination = await Paginate(
    Models.Department,
    { deleted: false },
    query.page,
    query.limit
  );

  let departments = await Models.Department.findAll({
    order: [["createdAt", "desc"]],
    limit: pagination.limit,
    offset: pagination.offset,
    where: {
      deleted: false,
    },
    attributes: { exclude: ["deleted"] },
  });

  return res.status(200).json({
    status: "success",
    message: "All Departments fecthed successfully",
    data: {
      departments,
      pagination,
    },
  });
});

module.exports.updateDepartment = CatchAsync(async (req, res, next) => {
  const { id } = req.params;

  const checkDepartmentInDB = await Models.Department.findOne({
    where: { id },
  });
  if (!checkDepartmentInDB)
    return next(new AppError("Invalid ID. Department not found", 404));

  if (req.body.data) {
    let [, [department]] = await Models.Department.update(
      { ...req.body.data },
      {
        where: { id, deleted: false },
        returning: true,
      }
    );

    department = Helpers.convertToPlainJSObject(department);

    return res.status(200).json({
      status: "success",
      message: "Department updated successfully",
      data: {
        department,
      },
    });
  }
  return res.status(200).json({
    status: "fail",
    message: "No data is given to update the department",
  });
});
