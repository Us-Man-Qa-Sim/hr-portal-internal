const { check, param, body } = require("express-validator");

module.exports.validateAddEmployees = [
  check("data.projectId").exists().withMessage("Project Id is required"),
  body("data.employees")
    .exists()
    .withMessage("Employees Data  is required")
    .isArray()
    .withMessage("Employees data must be in a Array"),
];

module.exports.validateRemoveEmployees = [
  check("data.projectId").exists().withMessage("Project Id is required"),
  body("data.employeeId").exists().withMessage("Employee Id  is required"),
];

module.exports.validateIDparam = [
  param("id").exists().withMessage("Project Id is required as param"),
];
