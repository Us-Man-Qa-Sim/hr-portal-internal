const { param, query, body } = require("express-validator");

module.exports.validateAddEmergencyContact = [
  param("id").exists().withMessage("User id  is required"),

  body("data.name")
    .exists()
    .withMessage("Name is required")
    .notEmpty()
    .withMessage("name filed should not be empty"),
  body("data.relationship")
    .exists()
    .withMessage("Relationship is required ")
    .notEmpty()
    .withMessage("relationship filed should not be empty"),
  body("data.phone")
    .exists()
    .withMessage("Phone is required ")
    .notEmpty()
    .withMessage("phone field should not be empty"),
];

module.exports.validateIDparam = [
  param("id").exists().withMessage("Id is required as Path Variables"),
];
module.exports.validateparam = [
  param("id").exists().withMessage("Id is required as Path Variables"),
  query("contactId")
    .exists()
    .withMessage("Contact Id is required as Query Params")
    .notEmpty()
    .withMessage("Contact Id should not be empty"),
];
