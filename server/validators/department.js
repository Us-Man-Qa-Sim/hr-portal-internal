const { check, param } = require("express-validator");

module.exports.validateAddDepartment = [
  check("data.title").exists().withMessage("Title is required"),
];
module.exports.validateDepartmentIdparam = [
  param("id").exists().withMessage("Department Id is required as param"),
];
module.exports.validatePaymentHeadtIdparam = [
  param("id")
    .exists()
    .withMessage("Payment Head Id is required as param")
    .isNumeric()
    .withMessage("Payment Head Id must be a numeric value"),
];
