const Models = require("../models");
const AppError = require("../utils/AppError");
const CatchAsync = require("../utils/CatchAsync");
const Helpers = require("../utils/Helpers");
const Paginate = require("../utils/Paginate");

module.exports.addProjectEmployees = CatchAsync(async (req, res, next) => {
  {
    const { projectId, employees } = req.body.data;

    const checkProjectInDB = await Models.Project.findOne({
      where: { id: projectId },
    });

    if (!checkProjectInDB)
      return next(new AppError("Invalid Id, Project not found", 400));

    let projectEmployees = [];

    projectEmployees = employees?.map((employee) => {
      return {
        projectId,
        employeeId: employee.id,
        isLead: employee.isLead,
      };
    });

    await Models.ProjectEmployee.bulkCreate(projectEmployees);

    return res.status(200).json({
      status: "success",
      message: "Employees added successfully",
    });
  }
});

module.exports.removeEmployee = CatchAsync(async (req, res, next) => {
  const { projectId, employeeId } = req.body.data;
  const { user } = req;

  const checkEmployeeToProjectInDB = await Models.ProjectEmployee.findOne({
    where: { projectId, employeeId },
  });

  let employee = await Models.User.findOne({ where: { id: employeeId } });

  if (!checkEmployeeToProjectInDB)
    return next(new AppError("Invalid ID. Employee  not found", 404));

  // let employeeTasks = await Models.Task.findAll({
  //   where: { projectId, employeeId },
  // });

  // await Models.ProjectEmployee.destroy({ where: { projectId, employeeId } });

  // employeeTasks.forEach(async (task) => {
  //   await Models.Comment.create({
  //     taskId: task.id,
  //     userId: user.id,
  //     text: ` removed employee ${employee.name} form project`,
  //     isLog: true,
  //   });

  //   await Models.Task.update(
  //     { employeeId: null },
  //     { where: { id: task.id }, returning: true }
  //   );

  // });

  return res.status(200).json({
    status: "success",
    message: "Employee deleted successfully",
    data: {
      projectId,
      employeeId,
    },
  });
});

module.exports.getEmployee = CatchAsync(async (req, res, next) => {
  const { query } = req;
  const { id } = req.params;

  let whereCaluse = { projectId: id };

  if (query.isLead && query.isLead === "true") {
    whereCaluse["isLead"] = true;
  }

  let projectEmployees = await Models.ProjectEmployee.findAll({
    where: whereCaluse,
    attributes: {
      exclude: ["createdAt", "projectId", "employeeId", "updatedAt"],
    },
    include: [
      {
        model: Models.User,
        attributes: ["id", "name", "email"],
      },
      {
        model: Models.Project,
        attributes: ["id", "title"],
      },
    ],
    order: [["createdAt", "desc"]],
  });

  return res.status(200).json({
    status: "success",
    message: "All project Employees fecthed successfully",
    data: {
      projectEmployees,
    },
  });
});

module.exports.getAccount = CatchAsync(async (req, res, next) => {
  const { id: AccountId } = req.params;
  let account = await Models.Account.findOne({
    attributes: { exclude: ["userId", "bankId"] },
    where: { id: AccountId },
    include: [
      {
        model: Models.User,
        as: "user",
        attributes: [["id", "userId"], "name", "email"],
      },
      {
        model: Models.Bank,
        as: "bank",
        attributes: [["id", "bankId"], "title"],
      },
    ],
  });
  if (!account) return next(new AppError("Invalid ID. Account not found", 404));
  return res.status(200).json({
    status: "success",
    message: "Account fecthed successfully",
    data: {
      account,
    },
  });
});

module.exports.updateAccount = CatchAsync(async (req, res, next) => {
  const { id } = req.params;

  let checkAccountInDB = await Models.Account.findOne({ where: { id } });

  if (!checkAccountInDB)
    return next(new AppError("Invalid ID. Account not found", 404));
  // const newAccount = { ...req.body, ...checkAccountInDB };
  // checkAccountInDB = { ...req.body };

  let [, [account]] = await Models.Account.update(
    { ...req.body.data },
    { where: { id }, returning: true }
  );

  account = Helpers.convertToPlainJSObject(account);

  return res.status(200).json({
    status: "success",
    message: "Account updated successfully",
    data: {
      account,
    },
  });
});

module.exports.getUserAccount = CatchAsync(async (req, res, next) => {
  const { user } = req;

  let account = await Models.Account.findOne({
    attributes: { exclude: ["userId", "bankId"] },
    where: { userId: user.id },
    include: [
      {
        model: Models.Bank,
        as: "bank",
        attributes: [["id", "bankId"], "title"],
      },
    ],
  });

  if (!account) return next(new AppError("Account not found", 404));

  return res.status(200).json({
    status: "success",
    message: "Account fecthed successfully",
    data: {
      account,
    },
  });
});
