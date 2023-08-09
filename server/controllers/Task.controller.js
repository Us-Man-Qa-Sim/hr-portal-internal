const Models = require("../models");
const AppError = require("../utils/AppError");
const CatchAsync = require("../utils/CatchAsync");
const { StatusIds, StatusTitle } = require("../configs/Constants");
const Helpers = require("../utils/Helpers");
const Services = require("../Services/Task.service");
const { Op } = require("sequelize");
const moment = require("moment");
const { email } = require("../email/sendPaySlip");

module.exports.getTasks = CatchAsync(async (req, res, next) => {
  const { query } = req;
  const { projectId } = req.params;

  let whereCaluse = { projectId: projectId, deleted: false };

  if (query.taskId) whereCaluse["id"] = query.taskId;
  if (query.sprintId) whereCaluse["sprintId"] = query.sprintId;

  let task = await Models.Task.findAll({
    where: whereCaluse,
    include: [
      {
        model: Models.Project,
        attributes: ["id", "title", "createdAt"],
      },
      {
        model: Models.Status,
        attributes: ["id", "title", "color"],
      },
      {
        model: Models.User,
        as: "employee",
        attributes: ["id", "name", "email", "profilePhoto"],
      },
      {
        model: Models.User,
        as: "taskCreator",
        attributes: ["id", "name", "email", "profilePhoto"],
      },
      {
        model: Models.Issue,
      }, {
        model: Models.Bug,
        attributes: ['id'],
        required: false,
        where: { deleted: false }
      },
      {
        model: Models.Comment,
      },
      {
        model: Models.Sprint,

        attributes: ["id", "startDate", "endDate", "sprint"],
      },
    ],
    attributes: [
      "id",
      "title",
      "priority",
      "parentId",
      "projectId",
      "createdAt",
      "description",
      "sprintId",
    ],
    order: [["createdAt", "desc"]],
  });

  task = Helpers.convertToPlainJSObject(task);

  res.status(200).json({
    status: "Success",
    message: "Task fetched successfully",
    data: {
      task,
    },
  });
});

module.exports.createTask = CatchAsync(async (req, res, next) => {
  const { user } = req;
  const { data } = req.body;
  data["statusId"] = StatusIds.Pending;
  data["createdby"] = user.id;

  const project = await Models.Project.findOne({
    where: { id: data.projectId, deleted: false },
  });

  if (!project)
    return next(new AppError("Project not found or incorrect Project ID", 400));

  const checkProjectEmployeeInDB = await Models.ProjectEmployee.findOne({
    where: { projectId: data.projectId, employeeId: data.employeeId },
  });

  if (!checkProjectEmployeeInDB)
    return next(
      new AppError("Invalid, Employee is not assigned to this project", 400)
    );

  let task = await Models.Task.create({ ...data });

  task = Helpers.convertToPlainJSObject(task);
  task = Helpers.removeDelete(task);
  let userData = await Models.User.findOne({
    where: { id: data.employeeId },
    attributes: ["id", "name", "email"],
  });

  await email({
    to: userData.email,
    subject: "New Task",
    html: `Dear ${userData.name},<br> New task <strong>${task.title}</strong> is assigned to you in project <strong>${project.title}</strong>`,
    attachments: null,
  });

  Services.calculateProgress(task.projectId);
  let progress = await Services.calculateSprintProgress(
    data.projectId,
    data.sprintId
  );

  task["progress"] = progress;

  await Models.Comment.create({
    taskId: task.id,
    userId: user.id,
    text: ` created task ${task.title}`,
    isLog: true,
  });

  await Models.Comment.create({
    taskId: task.id,
    userId: user.id,
    text: ` added task ${task.title} to project ${project.title}`,
    isLog: true,
  });

  res.status(200).json({
    status: "Success",
    message: "Task created successfully",
    data: {
      task,
    },
  });
});

module.exports.deleteTask = CatchAsync(async (req, res, next) => {
  const { id } = req.params;

  const checkTaskInDB = await Models.Task.findOne({
    where: { id, deleted: false },
  });
  if (!checkTaskInDB)
    return next(new AppError("Invalid ID. Task not found", 404));

  let [, []] = await Models.Task.update(
    { deleted: true },
    { where: { id }, returning: true }
  );
  Services.calculateProgress(checkTaskInDB.projectId);
  let progress = await Services.calculateSprintProgress(
    checkTaskInDB.projectId,
    checkTaskInDB.sprintId
  );
  return res.status(200).json({
    status: "success",
    message: "Task deleted successfully",
    progress,
  });
});

module.exports.updateTask = CatchAsync(async (req, res, next) => {
  const { user } = req;
  const { id } = req.params;
  const { data } = req.body;

  let checkTaskInDB = await Models.Task.findOne({
    where: { id, deleted: false },
  });

  if (!checkTaskInDB)
    return next(new AppError("Invalid ID. Task not found", 404));

  let [, [task]] = await Models.Task.update(
    { ...data },
    { where: { id }, returning: true }
  );

  if (data.employeeId && task.employeeId !== checkTaskInDB.employeeId) {
    let newUser = await Models.User.findOne({ where: { id: task.employeeId } });
    await Models.Comment.create({
      taskId: task.id,
      userId: user.id,
      text: ` assigned new user ${newUser.name} to task ${task.title}`,
      isLog: true,
    });
  }

  if (checkTaskInDB.sprintId !== task.sprintId) {
    let oldSprint = await Models.Sprint.findOne({
      where: { id: checkTaskInDB.sprintId },
    });
    let newSprint = await Models.Sprint.findOne({
      where: { id: task.sprintId },
    });

    await Models.Comment.create({
      taskId: task.id,
      userId: user.id,
      text: ` shift the task from sprint ${oldSprint.sprint} to sprint ${newSprint.sprint}`,
      isLog: true,
    });
  }

  let progress = Services.calculateSprintProgress(
    task.projectId,
    checkTaskInDB.sprintId
  );

  task = Helpers.convertToPlainJSObject(task);

  return res.status(200).json({
    status: "success",
    message: "Task updated successfully",
    data: {
      task,
      progress,
    },
  });
});

module.exports.changeStatus = CatchAsync(async (req, res, next) => {
  const { user } = req;
  const { statusId } = req.body.data;
  const { id } = req.params;

  const checkTaskInDB = await Models.Task.findOne({
    where: { id },
  });
  if (!checkTaskInDB)
    return next(new AppError("Invalid ID. Task not found", 404));

  let leads = await getProjectLead(checkTaskInDB.projectId)

  if (StatusIds.Complete === statusId) {
    let isLead = leads.find((lead) => lead.id === user.id)

    if (!isLead) return next(new AppError("Only Project Lead shift task to complete status", 404));
  }

  let [, [task]] = await Models.Task.update(
    { statusId },
    { where: { id }, returning: true }
  );

  StatusIds.Testing === task.statusId && await email({
    to: leads.map((lead) => lead.email),
    subject: "New Testing Task",
    html: `Dear ${user.name},<br> shifts <strong>${task.title}</strong> into testing status`,
    attachments: null,
  })

  Services.calculateProgress(checkTaskInDB.projectId);
  let progress = await Services.calculateSprintProgress(
    task.projectId,
    task.sprintId
  );

  if (statusId !== checkTaskInDB.statusId) {
    let newStatus = await Models.Status.findOne({
      where: { id: task.statusId },
    });
    await Models.Comment.create({
      taskId: task.id,
      userId: user.id,
      text: ` change task status to ${newStatus.title}`,
      isLog: true,
    });
  }

  return res.status(200).json({
    status: "success",
    message: `Task status changed successfully`,
    progress,
  });
});

module.exports.getKanBanTasks = CatchAsync(async (req, res, next) => {
  const { projectId } = req.params;
  const { query } = req;
  let todayDate = new Date();
  let sprint = await Models.Sprint.findOne({
    where: {
      startDate: {
        [Op.lte]: todayDate,
      },
      endDate: {
        [Op.gte]: todayDate,
      },
    },
  });
  let whereCaluse = {
    deleted: false,
    projectId,
    sprintId: query.sprintId ? query.sprintId : sprint.id,
  };

  let tasks = await Models.Task.findAll({
    attributes: {
      exclude: [
        "employeeId",
        "deleted",
        "createdAt",
        "updatedAt",
        "createdby",
        "parentId",
      ],
    },
    where: whereCaluse,
    include: [
      {
        model: Models.User,
        as: "employee",
        attributes: ["id", "name", "email", "profilePhoto"],
      },
      {
        model: Models.Sprint,

        attributes: ["id", "startDate", "endDate", "sprint"],
      },
      {
        model: Models.Bug,
        attributes: ['id'],
        required: false,
        where: { deleted: false }
      },
    ],
    order: [["updatedAt", "DESC"]],
  });

  tasks = Helpers.convertToPlainJSObject(tasks);

  let progress = await Services.calculateSprintProgress(
    projectId,
    whereCaluse.sprintId
  );

  let data = Services.getKanBanTasks(tasks);
  data["progress"] = progress;

  res.status(200).json({
    status: "Success",
    message: "Task fetched successfully",
    data,
  });
});

module.exports.getProgress = CatchAsync(async (req, res, next) => {
  const { projectId } = req.params;

  let progress = await Models.Project.findOne({
    where: { id: projectId, deleted: false },
    attributes: ["progress"],
  });

  res.status(200).json({
    status: "Success",
    message: "Project Progress fetched successfully",
    progress,
  });
});

module.exports.getSprints = CatchAsync(async (req, res, next) => {
  const { query } = req;

  let whereCaluse = {}
  whereCaluse['year'] = query?.year ? query.year : undefined

  Object.keys(whereCaluse).forEach((item) => {
    if (whereCaluse[item] === undefined) delete whereCaluse[item];
  });


  if (query?.id) {
    let sprint = await Models.Sprint.findOne({ where: { id: query.id } })
    return res.status(200).json({
      status: "success",
      message: "Sprint fetched successfully",
      data: { sprints: sprint },
    });
  }

  let sprints = await Models.Sprint.findAll({
    where: whereCaluse,
    attributes: {
      exclude: ["createdAt", "updatedAt"],
    },
  });

  sprints = Helpers.convertToPlainJSObject(sprints);
  let today = moment(new Date()).format("YYYY-MM-DD");

  sprints = sprints.map((sprint) => {
    let { endDate, startDate } = sprint;
    startDate = moment(startDate).format("YYYY-MM-DD");
    endDate = moment(endDate).format("YYYY-MM-DD");

    sprint["isCurrent"] = moment(today).isBetween(
      startDate,
      endDate,
      undefined,
      "[]"
    );
    startDate = moment(startDate, "YYYY-MM-DD").add(2, "days");
    sprint["label"] = `Sprint ${sprint.sprint} (${moment(startDate).format(
      "DD-MMM"
    )} - ${moment(endDate).format("DD-MMM")})`;
    startDate = moment(startDate).format("YYYY-MM-DD");
    sprint["startDate"] = startDate;
    sprint["endDate"] = moment(endDate).format("YYYY-MM-DD");
    return sprint;
  });

  return res.status(200).json({
    status: "success",
    message: "Sprints fetched successfully",
    data: { sprints },
  });
});

const getProjectLead = async (projectId) => {

  let leads = await Models.User.findAll({
    include: [{ model: Models.ProjectEmployee, where: { projectId, isLead: true } }],
    attributes: ['id', 'name', 'email', 'deviceToken']
  })

  leads = Helpers.convertToPlainJSObject(leads)
  return leads
}