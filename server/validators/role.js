const { check, param } = require("express-validator");

module.exports.validateAddRole = [
  check("data.title").exists().withMessage("Title is required"),
];

module.exports.validateIDparam = [
  param("id")
    .exists()
    .withMessage("Role Id is required as param")
    .isNumeric()
    .withMessage("Role Id must be a numeric value"),
];
