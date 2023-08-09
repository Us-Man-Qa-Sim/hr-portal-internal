const { check, param } = require("express-validator");

module.exports.validateAddPermission = [
  check("data.moduleId").exists().withMessage("Module Id is required"),
  check("data.roleId").exists().withMessage("Role Id is required"),
];

module.exports.validateIDparam = [
  param("id").exists().withMessage("Module Id is required as param"),
];
