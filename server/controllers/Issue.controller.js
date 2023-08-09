const Models = require("../models");
const AppError = require("../utils/AppError");
const CatchAsync = require("../utils/CatchAsync");
const Helpers = require("../utils/Helpers");

module.exports.addIssue = CatchAsync(async (req, res, next) => {
  const { data } = req.body;
  const { user } = req;

  const checkTaskInDB = await Models.Task.findOne({
    where: { id: data.taskId },
  });

  if (!checkTaskInDB)
    return next(new AppError("Invalid , Task not found", 404));
  data["userId"] = user.id;

  let issue = await Models.Issue.create({ ...data });

  issue = Helpers.convertToPlainJSObject(issue);

  return res.status(201).json({
    status: "success",
    message: "Issue added successfully",
    data: {
      issue,
    },
  });
});

module.exports.updateIssue = CatchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { data } = req.body;
  const checkIssueInDB = await Models.Issue.findOne({ where: { id } });

  if (!checkIssueInDB)
    return next(new AppError("Invalid, No issue found", 404));

  if (!data)
    return next(
      new AppError("Invalid, Data is not found to update the Issue", 404)
    );
  let [, [issue]] = await Models.Issue.update(
    { ...data },
    { where: { id }, returning: true }
  );

  return res.status(200).json({
    status: "success",
    message: "Issue updated successfully",
    data: {
      id,
    },
  });
});

module.exports.deleteIssue = CatchAsync(async (req, res, next) => {
  const { id } = req.params;
  const checkIssueInDB = await Models.Issue.findOne({ where: { id } });

  if (!checkIssueInDB)
    return next(new AppError("Invalid, No issue found", 404));

  await Models.Issue.destroy({ where: { id } });

  return res.status(200).json({
    status: "success",
    message: "Issue deleted successfully",
    data: {
      id,
    },
  });
});

module.exports.getIssue = CatchAsync(async (req, res, next) => {
  const { taskId } = req.params;

  let checkTaskInDB = await Models.Task.findOne({ where: { id: taskId } });
  if (!checkTaskInDB)
    return next(new AppError("Invalid ID. Task not found", 404));

  let issues = await Models.Issue.findAll({
    where: { taskId },
    order: [["updatedAt", "DESC"]],
    attributes: {
      exclude: ["createdAt", "updatedAt", "issueId", "parentId"],
    },
  });

  return res.status(200).json({
    status: "success",
    message: "All Issues fecthed successfully",
    data: {
      issues,
    },
  });
});

module.exports.issueReplies = CatchAsync(async (req, res, next) => {
  const { id } = req.params;

  let checkIssueInDB = await Models.Issue.findOne({ where: { id } });

  if (!checkIssueInDB)
    return next(new AppError("Invalid ID. Issue not found", 404));

  let issuesReplies = await Models.Comment.findAll({
    where: { issueId: id, parentId: null },
    order: [["updatedAt", "DESC"]],
    attributes: {
      exclude: ["createdAt", "updatedAt", "issueId", "parentId"],
    },
  });

  return res.status(200).json({
    status: "success",
    message: "All Issue replies fecthed successfully",
    data: {
      issuesReplies,
    },
  });
});
