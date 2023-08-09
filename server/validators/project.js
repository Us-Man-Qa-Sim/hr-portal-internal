const { check, param, query } = require("express-validator");
const { projectStatusIds } = require('../configs/Constants')
module.exports.validateAddProject = [
  check("data.title").exists().withMessage("Title is required"),
  check("data.description").exists().withMessage("Description is required"),
  check("data.clientId").exists().withMessage("Client id  is required"),
  check("data.departmentId").exists().withMessage("Department Id is required"),
  check("data.startDate")
    .exists()
    .withMessage("Project start date are required")
    .isDate()
    .withMessage("Start date should be in Date format"),
  check("data.deadline")
    .exists()
    .withMessage("Project deadline are required")
    .isDate()
    .withMessage("Deadline should be in Date format"),
  check("data.priority").exists().withMessage("Project hours are required"),
  check("data.createdBy").exists().withMessage("Project creator is required"),
];

module.exports.validateIDparam = [
  param("id").exists().withMessage("Project Id is required as param"),
];
module.exports.validateProjectIdparam = [
  param("projectId").exists().withMessage("Project Id is required as param"),
];

module.exports.validateProjectQuery = [
  query('statusId').optional()
    .isUUID().withMessage('statusId should be valid UUID')
    .isIn(Object.values(projectStatusIds))
    .withMessage(`statusId must be one of [${Object.values(projectStatusIds)}]`),
  query('departmentId').optional()
    .isUUID().withMessage('departmentId should be valid UUID'),
  query('projectName').optional()
    .isString().withMessage('statusId should be valid UUID')
]