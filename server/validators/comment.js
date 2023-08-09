const { check, param } = require("express-validator");
const AppError = require("../utils/AppError");
module.exports.validateAddcomment = [
  check("data.text").exists().withMessage("Text is required"),
  check("data.taskId").exists().withMessage("Task Id is required"),
];

module.exports.validateReplyToComment = [
  check("data.text").exists().withMessage("Text is required"),
  check("data.taskId").exists().withMessage("Task Id is required"),
  check("data.parentId").exists().withMessage("Parent Id is required"),
];

module.exports.validateReplyToIssue = [
  check("data.text").exists().withMessage("Text is required"),
  param("id").exists().withMessage("Issue Id is required"),
];

module.exports.validateIDparam = [
  param("id").exists().withMessage("Id is required"),
];
module.exports.validateGetComment = [
  param("taskId").exists().withMessage("Id is required"),
];
module.exports.ValidatePicture = async (req, res, next) => {
  //we can also check file type here too
  if (!req.files || req.files.length == 0) {
    // console.log("checking the file");
    next(new AppError("File is required", 400));
  }
  next();
};
