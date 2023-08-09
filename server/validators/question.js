const { check, param } = require("express-validator");

module.exports.validateAddQuestion = [
  check("data.text").exists().withMessage("Question text is required"),
  check("data.departmentId")
    .exists()
    .withMessage("Department Id is required")
    .isNumeric()
    .withMessage("Department Id must be a numeric value"),
];

module.exports.validateQuestionIdparam = [
  param("id")
    .exists()
    .withMessage("Question Id is required as param")
    .isNumeric()
    .withMessage("Question Id must be a numeric value"),
];

module.exports.validateDepartmentId = [
  check("data.departmentId")
    .exists()
    .withMessage("Department Id is required")
    .isNumeric()
    .withMessage("Department Id must be a numeric value"),
];
