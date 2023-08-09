const Models = require("../models");
const AppError = require("../utils/AppError");
const CatchAsync = require("../utils/CatchAsync");
const { StatusIds, StatusTitle } = require("../configs/Constants");
const Helpers = require("../utils/Helpers");
const Services = require("../Services/Task.service");
const { Op } = require("sequelize");
const Paginate = require("../utils/Paginate");
const { email } = require("../email/sendPaySlip");
let statuses = ["Open", "Close"];
let priorities = ["High", "Low"];

module.exports.getBugs = CatchAsync(async (req, res, next) => {
  const { query } = req;
  const { id } = req.params;

  const task = await Models.Task.findOne({
    where: { id, deleted: false },
  });

  if (!task)
    return next(new AppError("Task not found or incorrect Task Id", 400));

  let whereClause = {
    taskId: id,
    deleted: false,
    priority:
      query.priority && priorities.includes(query.priority)
        ? query.priority
        : undefined,
    status:
      query.status && statuses.includes(query.status)
        ? query.status
        : undefined,
  };

  Object.keys(whereClause).forEach((key) => {
    if (whereClause[key] === undefined) {
      delete whereClause[key];
    }
  });

  const pagination = await Paginate(
    Models.Bug,
    whereClause,
    query.page,
    query.limit
  );

  let bugs = await Models.Bug.findAll({
    where: whereClause,
    include: [
      {
        model: Models.Task,
        attributes: ["id", "title", "createdAt"],
      },
      {
        model: Models.User,
        as: "employee",
        attributes: ["id", "name", "email", "profilePhoto"],
      },
      {
        model: Models.User,
        as: "creator",
        attributes: ["id", "name", "email", "profilePhoto"],
      },
      {
        model: Models.BugLog,
        attributes: ["id", "userId", "text", "createdAt"],
        include: [
          {
            model: Models.User,
            attributes: ["id", "name", "email", "profilePhoto"],
          },
        ],
      },
    ],
    order: [
      ["status", "desc"],
      ["priority", "ASC"],
      ["updatedAt", "desc"],
    ],
    limit: pagination.limit,
    offset: pagination.offset,
  });

  bugs = Helpers.convertToPlainJSObject(bugs);

  res.status(200).json({
    status: "Success",
    message: "Bugs fetched successfully",
    data: {
      pagination,
      bugs,
    },
  });
});

module.exports.createBug = CatchAsync(async (req, res, next) => {
  const { user } = req;
  const { data } = req.body;
  data["createdby"] = user.id;
  let userData = null;

  const task = await Models.Task.findOne({
    where: { id: data.taskId, deleted: false },
  });

  if (!task)
    return next(new AppError("Task not found or incorrect Task Id", 400));

  if (data.employeeId) {
    userData = await Models.User.findOne({
      where: { id: data.employeeId },
      attributes: ["id", "name", "email"],
    });
    if (!userData) return next(new AppError("User not found", 400));

    const checkProjectEmployeeInDB = await Models.ProjectEmployee.findOne({
      where: { projectId: task.projectId, employeeId: data.employeeId },
    });

    if (!checkProjectEmployeeInDB)
      return next(
        new AppError("Invalid, Employee is not assigned to this project", 400)
      );
  }

  let bug = await Models.Bug.create({ ...data });

  bug = Helpers.convertToPlainJSObject(bug);
  bug = Helpers.removeDelete(bug);

  data.employeeId &&
    (await email({
      to: userData.email,
      subject: `New Bug is Open`,
      html: `Dear ${userData.name},<br>Bug title <strong>${bug.title}</strong><br> Open by <strong>${user.name}</strong> <br> Related task <strong>${task.title}</strong>`,
      attachments: null,
    }));

  // task["progress"] = progress;

  let text = data.employeeId
    ? `${user.name} opend a bug ${bug.title} and assigned to ${userData.name}`
    : `${user.name} opend a bug ${bug.title}`;

  bug &&
    (await Models.BugLog.create({
      bugId: bug.id,
      userId: user.id,
      text,
    }));

  res.status(201).json({
    status: "Success",
    message: "Bug created successfully",
    data: {
      bug,
    },
  });
});

module.exports.deleteBug = CatchAsync(async (req, res, next) => {
  const { id } = req.params;

  const checkBugInDB = await Models.Bug.findOne({
    where: { id, deleted: false },
  });

  if (!checkBugInDB)
    return next(new AppError("Invalid ID. Bug not found", 404));

  let [, []] = await Models.Bug.update(
    { deleted: true },
    { where: { id }, returning: true }
  );

  return res.status(200).json({
    status: "success",
    message: "Bug deleted successfully",
  });
});

module.exports.updatebug = CatchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { data } = req.body;
  const checkBugInDB = await Models.Bug.findOne({
    where: { id, deleted: false },
  });

  if (!checkBugInDB)
    return next(new AppError("Invalid ID. Bug not found", 404));

  let [, [bug]] = await Models.Bug.update(
    { ...data },
    { where: { id }, returning: true }
  );

  return res.status(200).json({
    status: "success",
    message: "Bug updated successfully",
    data: {
      bug,
    },
  });
});

module.exports.changeBugStatus = CatchAsync(async (req, res, next) => {
  const { id } = req.params;
  const {
    user,
    body: { data },
  } = req;
  const checkBugInDB = await Models.Bug.findOne({
    where: { id, deleted: false },
  });

  if (!checkBugInDB)
    return next(new AppError("Invalid ID. Bug not found", 404));

  let [, [bug]] = await Models.Bug.update(
    { status: data.status },
    { where: { id }, returning: true }
  );

  let text = `${user.name} change status from ${checkBugInDB.status} to ${bug.status}`;

  bug &&
    (await Models.BugLog.create({
      bugId: bug.id,
      userId: user.id,
      text,
    }));

  return res.status(200).json({
    status: "success",
    message: `Bug status changed successfully`,
  });
});

module.exports.assignEmployeeToBug = CatchAsync(async (req, res, next) => {
  const { id } = req.params;
  const {
    user,
    body: { data },
  } = req;

  let userData = await Models.User.findOne({
    where: { id: data.employeeId, deleted: false },
    attributes: ["id", "name", "email"],
  });

  if (!userData) return next(new AppError("User not found", 400));

  let permission = await Models.Permission.findOne({
    where: {
      designationId: user.designationId,
      roleId: user.roleId,
    },
    include: [
      {
        model: Models.Module,
        where: { title: "taskMangament" },
      },
    ],
    attributes: ["write", "update", "delete", "read"],
  });
  let { write } = permission;

  if (!write) return next(new AppError("You have no permission", 400));

  let bug = await Models.Bug.findOne({
    where: { id, deleted: false },
  });

  if (!bug) return next(new AppError("Bug not found or incorrect Bug Id", 400));

  if (bug.status === "Close")
    return next(
      new AppError("Bug is closed.You can not assign employee to this", 400)
    );
  
  
  if (bug.employeeId === data.employeeId)
    return next(
      new AppError("This employee is already assigned to this Bug", 400)
    );

  let task = await Models.Task.findOne({ where: { id: bug.taskId } });

  const checkProjectEmployeeInDB = await Models.ProjectEmployee.findOne({
    where: { projectId: task.projectId, employeeId: data.employeeId },
  });

  if (!checkProjectEmployeeInDB)
    return next(
      new AppError("Invalid, Employee is not assigned to this project", 400)
    );

  [, [bug]] = await Models.Bug.update(
    { employeeId: data.employeeId },
    { where: { id }, returning: true }
  );

  bug &&
    (await email({
      to: userData.email,
      subject: `New Bug is Open`,
      html: `Dear ${userData.name},<br>Bug title <strong>${bug.title}</strong><br> Open by <strong>${user.name}</strong> <br> Related task <strong>${task.title}</strong>`,
      attachments: null,
    }));

  bug &&
    (await Models.BugLog.create({
      bugId: bug.id,
      userId: user.id,
      text: `${user.name} assigned ${userData.name} to this bug`,
    }));

  res.status(200).json({
    status: "Success",
    message: "Employee Assigned to Bug successfully",
    data: {
      bug,
    },
  });
});