const { check, param, query, body } = require("express-validator");

module.exports.validateAddExperience = [
  param("id").exists().withMessage("User id  is required"),
  body("data.experienceData")
    .exists()
    .withMessage("Experience Data  is required")
    .isArray()
    .withMessage("Experience Data must be a Array")
    .notEmpty()
    .withMessage("Experience Data array should not be empty"),
  body("data.experienceData.*.jobPosition")
    .exists()
    .withMessage("Job Position is required")
    .notEmpty()
    .withMessage("jobPosition filed should not be empty"),
  body("data.experienceData.*.company")
    .exists()
    .withMessage("Company is required ")
    .notEmpty()
    .withMessage("company filed should not be empty"),
  body("data.experienceData.*.location")
    .exists()
    .withMessage("Location is required ")
    .notEmpty()
    .withMessage("location field should not be empty"),
  body("data.experienceData.*.startDate")
    .exists()
    .withMessage("start Date is required ")
    .notEmpty()
    .withMessage("startDate field should not be empty")
    .isDate()
    .withMessage("required in date format (YYYY-MM-DD)"),
];

module.exports.validateIDparam = [
  param("id").exists().withMessage("Id is required as param"),
];
