const Models = require("../models");
const AppError = require("../utils/AppError");
const CatchAsync = require("../utils/CatchAsync");
const Helpers = require("../utils/Helpers");

module.exports.addComment = CatchAsync(async (req, res, next) => {
  const { data } = req.body;
  const { user } = req;

  const checkTaskInDB = await Models.Task.findOne({
    where: { id: data.taskId, deleted: false },
  });
  if (!checkTaskInDB)
    return next(new AppError("Invalid Id, Task not found", 400));

  data["userId"] = user.id;
  let comment = await Models.Comment.create({ ...data });

  comment = Helpers.convertToPlainJSObject(comment);

  return res.status(201).json({
    status: "success",
    message: "Comment added successfully",
    data: {
      comment,
    },
  });
});

module.exports.replyComment = CatchAsync(async (req, res, next) => {
  const { data } = req.body;
  const { user } = req;

  const checkCommentInDB = await Models.Comment.findOne({
    where: { id: data.parentId },
  });
  if (!checkCommentInDB)
    return next(new AppError("Invalid Id, Comment not found", 400));

  data["userId"] = user.id;

  let comment = await Models.Comment.create({ ...data });

  comment = Helpers.convertToPlainJSObject(comment);
  comment = Helpers.removeDelete(comment);

  return res.status(201).json({
    status: "success",
    message: "Comment added successfully",
    data: {
      comment,
    },
  });
});

module.exports.replyIssue = CatchAsync(async (req, res, next) => {
  const { data } = req.body;
  const { user } = req;
  const { id } = req.params;
  const issue = await Models.Issue.findOne({
    where: { id },
  });
  if (!issue) return next(new AppError("Invalid Id, Issue not found", 400));

  data["userId"] = user.id;
  data["taskId"] = issue.taskId;
  data["issueId"] = issue.id;

  let comment = await Models.Comment.create({ ...data });

  comment = Helpers.convertToPlainJSObject(comment);
  comment = Helpers.removeDelete(comment);

  return res.status(201).json({
    status: "success",
    message: "Comment added in reply of Issue is added successfully",
    data: {
      data,
    },
  });
});

module.exports.getComments = CatchAsync(async (req, res, next) => {
  const { taskId } = req.params;
  const wherCaluse = { issueId: null, parentId: null };

  if (taskId) {
    let checkTaskInDB = await Models.Task.findOne({ where: { id: taskId } });
    if (!checkTaskInDB)
      return next(new AppError("Invalid ID. Task not found", 404));
    wherCaluse["taskId"] = taskId;
  }

  let comments = await Models.Comment.findAll({
    where: wherCaluse,
    attributes: {
      exclude: ["createdAt", "updatedAt", "issueId", "parentId"],
    },
    include: [
      {
        model: Models.User,
        attributes: ["id", "name", "profilePhoto", "email"],
      },
    ],
    order: [["updatedAt", "ASC"]],
  });

  return res.status(200).json({
    status: "success",
    message: "All Comments fecthed successfully",
    data: {
      comments,
    },
  });
});

module.exports.getReplies = CatchAsync(async (req, res, next) => {
  const { id } = req.params;

  const checkCommentInDB = await Models.Comment.findOne({
    where: { id, parentId: null },
  });
  if (!checkCommentInDB)
    return next(new AppError("Invalid Id, Comment not found", 400));

  let comments = await Models.Comment.findAll({
    where: { issueId: null, parentId: id },
    order: [["updatedAt", "DESC"]],
    attributes: {
      exclude: ["createdAt", "updatedAt", "parentId", "issueId"],
    },
  });

  return res.status(200).json({
    status: "success",
    message: "All Comment Replies fecthed successfully",
    data: {
      comments,
    },
  });
});

module.exports.updateComment = CatchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { data } = req.body;

  const checkCommentInDB = await Models.Comment.findOne({
    where: { id, parentId: null },
  });
  if (!checkCommentInDB)
    return next(new AppError("Invalid Id, Comment not found", 404));

  if (!data)
    return next(
      new AppError("Invalid, Data is not found to update the comment", 400)
    );
  let [, [comment]] = await Models.Comment.update(
    { ...data },
    { where: { id }, returning: true }
  );

  return res.status(200).json({
    status: "success",
    message: "Comment updated successfully",
    data: {
      id,
    },
  });
});

module.exports.deleteComment = CatchAsync(async (req, res, next) => {
  const { id } = req.params;

  const checkCommentInDB = await Models.Comment.findOne({
    where: { id, parentId: null },
  });
  if (!checkCommentInDB)
    return next(new AppError("Invalid Id, Comment not found", 400));

  await Models.Comment.destroy({ where: { id } });

  return res.status(200).json({
    status: "success",
    message: "Comment deleted successfully",
    data: {
      id,
    },
  });
});

module.exports.addFile = CatchAsync(async (req, res, next) => {
  const files = req.files;
  return res.status(200).json({
    status: "success",
    message: "File Added Successfully.",
    data: {
      file: files,
    },
  });
});
