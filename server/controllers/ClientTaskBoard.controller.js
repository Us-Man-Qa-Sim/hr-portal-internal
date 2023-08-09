const Models = require("../models");
const AppError = require("../utils/AppError");
const CatchAsync = require("../utils/CatchAsync");
const { ClientBoardStatusIds } = require("../configs/Constants");
const Helpers = require("../utils/Helpers");
const Services = require("../Services/Task.service");

module.exports.getClientTasks = CatchAsync(async (req, res, next) => {
  const { query } = req;
  const { projectId } = req.params;

  let whereCaluse = { projectId: projectId, deleted: false };

  if (query.taskId) whereCaluse["id"] = query.taskId;

  let task = await Models.ClientTask.findAll({
    where: whereCaluse,
    include: [
      {
        model: Models.Project,
        attributes: ["id", "title", "createdAt"],
      },
      {
        model: Models.ClientBoardStatus,
        attributes: ["id", "title", "color"],
      },
    ],
    order: [["createdAt", "desc"]],
  });

  task = Helpers.convertToPlainJSObject(task);

  res.status(200).json({
    status: "Success",
    message: "Client Task fetched successfully",
    data: {
      task,
    },
  });
});

module.exports.createClientTask = CatchAsync(async (req, res, next) => {
  const { data } = req.body;
  data["statusId"] = ClientBoardStatusIds[data.status];

  const project = await Models.Project.findOne({
    where: { id: data.projectId, deleted: false },
  });

  if (!project)
    return next(new AppError("Project not found or incorrect Project ID", 400));

  let task = await Models.ClientTask.create({ ...data });

  //   task = Helpers.convertToPlainJSObject(task);
  //   task = Helpers.removeDelete(task);

  res.status(201).json({
    status: "Success",
    message: "Client Task created successfully",
    data: {
      task,
    },
  });
});

module.exports.deleteClientTask = CatchAsync(async (req, res, next) => {
  const { id } = req.params;

  const checkClientTaskInDB = await Models.ClientTask.findOne({
    where: { id, deleted: false },
  });
  if (!checkClientTaskInDB)
    return next(new AppError("Invalid ID. Client task not found", 404));

  let [, []] = await Models.ClientTask.update(
    { deleted: true },
    { where: { id }, returning: true }
  );
  return res.status(200).json({
    status: "success",
    message: "Client Task deleted successfully",
  });
});

module.exports.updateClientTask = CatchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { data } = req.body;

  let checkClientTaskInDB = await Models.ClientTask.findOne({
    where: { id, deleted: false },
  });

  if (!checkClientTaskInDB)
    return next(new AppError("Invalid ID. Client task not found", 404));

  let [, [task]] = await Models.ClientTask.update(
    { ...data },
    { where: { id }, returning: true }
  );

  task = Helpers.convertToPlainJSObject(task);

  return res.status(200).json({
    status: "success",
    message: "Client Task updated successfully",
    data: {
      task,
    },
  });
});

module.exports.changeClientStatus = CatchAsync(async (req, res, next) => {
  const { statusId } = req.body.data;
  const { id } = req.params;

  const checkClientTaskInDB = await Models.ClientTask.findOne({
    where: { id },
  });
  if (!checkClientTaskInDB)
    return next(new AppError("Invalid ID. Client task not found", 404));

  let [, []] = await Models.ClientTask.update(
    { statusId },
    { where: { id }, returning: true }
  );

  return res.status(200).json({
    status: "success",
    message: `Client Task status changed successfully`,
  });
});

module.exports.getClientKanBanTasks = CatchAsync(async (req, res, next) => {
  const { projectId } = req.params;

  let tasks = await Models.ClientTask.findAll({
    where: { deleted: false, projectId },

    order: [["updatedAt", "DESC"]],
  });

  tasks = Helpers.convertToPlainJSObject(tasks);

  let data = Services.getClientKanBanTasks(tasks);

  res.status(200).json({
    status: "Success",
    message: "Cleint Tasks fetched successfully",
    data,
  });
});
