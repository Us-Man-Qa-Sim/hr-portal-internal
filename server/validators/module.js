const { check, param } = require("express-validator");

module.exports.validateAddModule = [
  check("data.title").exists().withMessage("Title is required"),
];

module.exports.validateIDparam = [
  param("id").exists().withMessage("Module Id is required as param"),
];
