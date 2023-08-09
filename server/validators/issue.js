const { check, param } = require("express-validator");

module.exports.validateAddIssue = [
  check("data.title").exists().withMessage("Issue title is required"),
  check("data.descrption").exists().withMessage("Issue descrption is required"),
  check("data.taskId").exists().withMessage("Task Id is required"),
];

module.exports.validateIDparam = [
  param("id").exists().withMessage("Issue Id is required"),
];
module.exports.validateGetIssues = [
  param("taskId").exists().withMessage("Task Id is required"),
];
