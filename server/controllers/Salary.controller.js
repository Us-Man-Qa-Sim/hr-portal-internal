const Models = require("../models");
const AppError = require("../utils/AppError");
const CatchAsync = require("../utils/CatchAsync");
const Helpers = require("../utils/Helpers");
const Paginate = require("../utils/Paginate");

module.exports.CreateSalary = CatchAsync(async (req, res, next) => {
  const { userId, baseSalary } = req.body.data;

  const checkUserInDB = await Models.User.findOne({ where: { id: userId } });

  if (!checkUserInDB)
    return next(
      new AppError("User with given id is not present in data base", 404)
    );
  const checkSalaryInDB = await Models.Salary.findOne({
    where: { userId: userId },
  });
  if (checkSalaryInDB)
    return next(
      new AppError(
        "User with given id has alareday created salary in data base",
        404
      )
    );

  let salary = await Models.Salary.create({
    baseSalary: baseSalary,
    userId: userId,
  });

  salary = Helpers.convertToPlainJSObject(salary);

  return res.status(200).json({
    status: "success",
    message: "Salary created successfully",
    data: {
      salary,
    },
  });
});

module.exports.getSalaries = CatchAsync(async (req, res, next) => {
  const { query } = req;

  const pagination = await Paginate(Models.Salary, {}, query.page, query.limit);

  let salaries = await Models.Salary.findAll({
    attributes: { exclude: ["userId"] },
    include: [
      {
        model: Models.User,
        as: "user",
        attributes: [["id", "userId"], "name", "email"],
      },
    ],
    order: [["createdAt", "desc"]],
    limit: pagination.limit,
    offset: pagination.offset,
  });

  let count = await Models.Salary.count();

  return res.status(200).json({
    status: "success",
    message: "Salaries fetched successfully",
    data: {
      pagination,
      salaries,
    },
  });
});

module.exports.deleteSalary = CatchAsync(async (req, res, next) => {
  const { id } = req.params;

  const checkSalaryInDB = await Models.Salary.findOne({ where: { id: id } });

  if (!checkSalaryInDB)
    return next(new AppError("Invalid ID. Salary not found", 404));

  let salary = await Models.Salary.destroy({ where: { id: id } });
  res.status(200).json({
    status: "success",
    message: "Salary is delated",
    data: { salaryid: id },
  });
});

module.exports.updateSalary = CatchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { data } = req.body;
  let checkSalaryInDB = await Models.Salary.findOne({ where: { id } });

  if (!checkSalaryInDB)
    return next(new AppError("Invalid ID. Salary not found", 404));

  if (data) {
    let [, [salary]] = await Models.Salary.update(data, {
      where: { id },
      returning: true,
    });

    salary = Helpers.convertToPlainJSObject(salary);
    return res.status(200).json({
      status: "success",
      message: "Salary updated successfully",
      data: {
        salary,
      },
    });
  }
  return res.status(200).json({
    status: "success",
    message: "No data is given to update the salary",
  });
});

module.exports.getSalary = CatchAsync(async (req, res, next) => {
  const { id } = req.params;

  let salary = await Models.Salary.findOne({
    where: { id: id },
    attributes: { exclude: ["userId"] },
    include: [
      {
        model: Models.User,
        as: "user",
        attributes: [["id", "userId"], "name", "email"],
      },
    ],
  });

  if (!salary) return next(new AppError("Salary not found", 404));
  salary = Helpers.convertToPlainJSObject(salary);

  return res.status(200).json({
    status: "success",
    message: "Salary fecthed successfully",
    data: {
      salary,
    },
  });
});

module.exports.getUserSalary = CatchAsync(async (req, res, next) => {
  const { userId } = req.params;
  console.log(userId);
  let salary = await Models.Salary.findOne({
    attributes: { exclude: ["userId"] },
    where: { userId: userId },
  });

  if (!salary) return next(new AppError("Salary not found", 404));

  return res.status(200).json({
    status: "success",
    message: "Salary fecthed successfully",
    data: {
      salary,
    },
  });
});

module.exports.getLoggedUserSalary = CatchAsync(async (req, res, next) => {
  const { user } = req;

  let salary = await Models.Salary.findOne({
    attributes: { exclude: ["userId"] },
    where: { userId: user.id },
    include: [
      {
        model: Models.User,
        as: "user",
        attributes: ["name", "email"],
      },
    ],
  });

  if (!salary) return next(new AppError("Salary not found", 404));

  return res.status(200).json({
    status: "success",
    message: "Salary fecthed successfully",
    data: {
      salary,
    },
  });
});
