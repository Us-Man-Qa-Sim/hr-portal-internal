const { check, param } = require("express-validator");

module.exports.validateAddProjectEquipemt = [
  check("data.name").exists().withMessage("Equipment name is required"),
  check("data.price").exists().withMessage("Equipment price is required"),
  check("data.quantity")
    .exists()
    .withMessage("Equipment quantity  is required"),
  check("data.projectId").exists().withMessage("project Id is required"),
];

module.exports.validateIDparam = [
  param("id").exists().withMessage("Project equipment Id is required as param"),
];
