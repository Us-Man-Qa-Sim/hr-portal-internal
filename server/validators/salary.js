const { check, param } = require("express-validator");

module.exports.validateCreateSalary = [
  check("data.baseSalary")
    .exists()
    .withMessage("Base salary is required")
    .isNumeric()
    .withMessage("Base Salary is requird in numeric form only"),
  check("data.userId")
    .exists()
    .withMessage("User id  is required")
    .isNumeric()
    .withMessage("User id must be a numeric value"),
];
module.exports.validateIDparam = [
  param("id")
    .exists()
    .withMessage("Salary Id is required as param")
    .isNumeric()
    .withMessage("Salary Id must be a numeric value"),
];
module.exports.validateUserIDparam = [
  param("userId")
    .exists()
    .withMessage("user Id is required as param")
    .isNumeric()
    .withMessage("user Id must be a numeric value"),
];

module.exports.validateCreateSalaryDetail = [
  check("data.salaryId")
    .exists()
    .withMessage("Salary id  is required")
    .isNumeric()
    .withMessage("Salary id must be a numeric value"),
  check("data.incentiveId")
    .exists()
    .withMessage("Incentive id  is required")
    .isNumeric()
    .withMessage("Incentive id must be a numeric value"),
];
