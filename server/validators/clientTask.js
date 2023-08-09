const { check, param, query, body } = require("express-validator");

module.exports.validateCreateTask = [
  check("data.title").exists().withMessage("Title is required"),
  check("data.description").exists().withMessage("Description is required"),
  check("data.priority").exists().withMessage("Priority  is required"),
];
module.exports.validateChangeStatus = [
  check("data.statusId").exists().withMessage("StatusId is required"),
];

module.exports.validateGetTasks = [
  param("projectId").exists().withMessage("Project id  is required"),
];

module.exports.validateIDparam = [
  param("id").exists().withMessage("Task Id is required as param"),
];

module.exports.validateBulkTask = [
  check("projectId").exists().withMessage("Project id is required"),
  check("excelData").exists().withMessage("Enter data to create bulk tasks"),
];
