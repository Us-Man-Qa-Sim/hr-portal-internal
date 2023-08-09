const { check, param, query, body } = require("express-validator");

module.exports.validateAddEducation = [
  param("id").exists().withMessage("User id  is required"),
  body("data.educationData")
    .exists()
    .withMessage("Experience Data  is required")
    .isArray()
    .withMessage("Experience Data must be a Array")
    .notEmpty()
    .withMessage("Experience Date array should not be empty"),
  body("data.educationData.*.institute")
    .exists()
    .withMessage("Institute is required ")
    .notEmpty()
    .withMessage("institute filed should not be empty"),
  body("data.educationData.*.subject")
    .exists()
    .withMessage("Subject is required ")
    .notEmpty()
    .withMessage("subject filed should not be empty"),
  body("data.educationData.*.degree")
    .exists()
    .withMessage("Degree is required ")
    .notEmpty()
    .withMessage("degree field should not be empty"),
  body("data.educationData.*.startDate")
    .exists()
    .withMessage("start Date is required ")
    .notEmpty()
    .withMessage("startDate field should not be empty")
    .isDate()
    .withMessage("required in date format (YYYY-MM-DD)"),
  body("data.educationData.*.endDate")
    .exists()
    .withMessage("End Date is required ")
    .notEmpty()
    .withMessage("endDate field should not be empty")
    .isDate()
    .withMessage("required in date format (YYYY-MM-DD)"),
];

module.exports.validateIDparam = [
  param("id").exists().withMessage("Id is required as param"),
];
