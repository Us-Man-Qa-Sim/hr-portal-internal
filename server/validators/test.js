const { check, param } = require("express-validator");

module.exports.validateCreateTest = [
  check("data.title").exists().withMessage("Emails are required"),
  check("data.departmentId")
    .exists()
    .withMessage("Department Id is required")
    .isNumeric()
    .withMessage("Department Id must be a numeric value"),
  check("data.questions")
    .exists()
    .withMessage("Questions are required")
    .isArray()
    .withMessage("Questions should be in array")
    .notEmpty()
    .withMessage("Questions array should not be empty"),
];

module.exports.validateAssignTest = [
  check("data.emails")
    .exists()
    .withMessage("Emails are required")
    .isArray()
    .withMessage("Emails should be in array")
    .notEmpty()
    .withMessage("Email Array should not be empty empty"),
  check("data.testId")
    .exists()
    .withMessage("Test Id is required")
    .isNumeric()
    .withMessage("Test Id must be a numeric value"),
  check("data.emails.*")
    .isEmail()
    .withMessage("Emais array should contain valid emails only"),
];

module.exports.validateQuestionIdparam = [
  param("id")
    .exists()
    .withMessage("Question Id is required as param")
    .isNumeric()
    .withMessage("Question Id must be a numeric value"),
];

module.exports.validateToken = [
  param("id")
    .exists()
    .withMessage("Token is required")
    .isLength({ min: 42 })
    .withMessage("Token should have 42 characters minimum"),
];

module.exports.validateSubmit = [
  param("id")
    .exists()
    .withMessage("Token is required")
    .isLength({ min: 42 })
    .withMessage("Token should have 42 characters minimum"),
  check("data.answers")
    .exists()
    .withMessage("Answer is required")
    .isArray()
    .withMessage("Answer should be of array type"),
  check("data.answers.*.questionId")
    .exists()
    .withMessage("Question Id of answer is required "),
];

module.exports.validateTestId = [
  param("id")
    .exists()
    .withMessage("Test id is required")
    .isNumeric()
    .withMessage("Test id should be numeric"),
];

module.exports.validateTestAnswer = [
  check("data.testUserId").exists().withMessage("Test User id is required"),
  check("data.testId").exists().withMessage("Test id is required"),
];
