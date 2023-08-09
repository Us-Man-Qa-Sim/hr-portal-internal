const { check, param } = require("express-validator");

module.exports.validateCreateBug = [
  check("data.title")
    .exists()
    .withMessage("Title is required")
    .notEmpty()
    .withMessage("Title should not be empty"),
  check("data.description")
    .exists()
    .withMessage("Description is required")
    .notEmpty()
    .withMessage("Description should not be empty"),
  check("data.taskId")
    .exists()
    .withMessage("taskId is required")
    .notEmpty()
    .withMessage("Task Id should not be empty"),
  check("data.priority")
    .exists()
    .withMessage("priority is required")
    .isIn(["High", "Low"])
    .withMessage("Bug priority must be one of [High, Low] "),
];
module.exports.validateChangeStatus = [
  check("data.status")
    .exists()
    .withMessage("status is required")
    .isIn(["Open", "Close"])
    .withMessage("Bug status must be one of [Open, Close] "),
];
module.exports.validateChangeEmployee = [
  check("data.employeeId")
    .exists()
    .withMessage("Employee Id is required")
    .notEmpty()
    .withMessage("Employee Id should not be empty"),
];
module.exports.validateIDparam = [
  param("id").exists().withMessage("Task Id is required as param"),
];
