const { check, param } = require("express-validator");

module.exports.validateAddHoliday = [
  check("data.holidayName")
    .exists()
    .withMessage("Holyday name is required")
    .notEmpty()
    .withMessage("Holyday name should not be empty"),
  check("data.date")
    .exists()
    .withMessage("Holyday date is required")
    .notEmpty()
    .withMessage("Holyday date should not be empty")
    .isDate()
    .withMessage("Holyday date should be in date format"),
  check("data.days")
    .exists()
    .withMessage("Holiday days are required")
    .notEmpty()
    .withMessage("days should not be empty"),
];

module.exports.validateIDparam = [
  param("id").exists().withMessage("Holiday Id is required as param"),
];
