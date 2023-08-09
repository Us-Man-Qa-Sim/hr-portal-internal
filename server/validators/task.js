const { check, param, query, body } = require("express-validator");

module.exports.validateCreateTask = [
  check("data.title").exists().withMessage("Title is required"),
  check("data.description").exists().withMessage("Description is required"),
  check("data.employeeId").exists().withMessage("Employee Id is required"),
  check("data.sprintId").exists().withMessage("Sprint Id is required"),
  check("data.priority").exists().withMessage("Priority  is required"),
  // check("data.dueDate")
  //   .exists()
  //   .withMessage("Duedate is required")
  //   .isDate()
  //   .withMessage("date type is required"),
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

module.exports.validateBulkCreationTask = [
  check("data.projectId")
    .exists()
    .withMessage("Project id  is required")
    .isNumeric()
    .withMessage("Project id must be a numeric value"),
  body("data.excelData")
    .exists()
    .withMessage("Excel Data  is required")
    .isArray()
    .withMessage("Project id must be a Array"),
  body("data.excelData.*.title")
    .exists()
    .withMessage("Task title is required "),
];

module.exports.validateSprintQuery = [
  query('id').optional().isUUID().withMessage('sprint id should be valid UUID')
]