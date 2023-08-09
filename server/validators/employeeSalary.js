const { check, param, query } = require("express-validator");

module.exports.validateAddEmployeeSalary = [
  check("data.baseSalary")
    .exists()
    .withMessage("baseSalary is required")
    .notEmpty()
    .withMessage("Base Salary should not be empty"),
  check("data.userId")
    .exists()
    .withMessage("User is required")
    .notEmpty()
    .withMessage("User should not be empty"),
  // check("data.incentives")
  //   .exists()
  //   .withMessage("Incentives are required")
  //   .isArray()
  //   .withMessage("incentives should be in array")
  //   .notEmpty()
  //   .withMessage("Incentives array should not be empty"),
];

module.exports.validateIdParam = [
  param("id").exists().withMessage("Id is required as param"),
];
