const { check, param } = require("express-validator");

module.exports.validateAddDesignation = [
  check("data.title").exists().withMessage("Title is required"),
  check("data.roleId").exists().withMessage("Role id is required"),
];

module.exports.validateIDparam = [
  param("id").exists().withMessage("Designation Id is required as param"),
];

module.exports.validateroleIDparam = [
  param("id").exists().withMessage("role Id is required as param"),
];
