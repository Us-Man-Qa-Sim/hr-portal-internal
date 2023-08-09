const express = require("express");
const { validateInputData } = require("../utils/Helpers");
const { Authenticate, CheckPermission } = require("../middlewares/Auth");
const Models = require("../models");
const ProjectEmployeeController = require("../controllers/ProjectEmployee.controller");
const {
  validateAddEmployees,
  validateRemoveEmployees,
  validateIDparam,
} = require("../validators/projectEmployee");

const router = express.Router();

router.use(Authenticate);

router
  .route("/")
  .post(
    CheckPermission("ProjectMangament"),
    validateAddEmployees,
    validateInputData,
    ProjectEmployeeController.addProjectEmployees
  )
  .delete(
    CheckPermission("ProjectMangament"),
    validateRemoveEmployees,
    validateInputData,
    ProjectEmployeeController.removeEmployee
  );

router.get(
  "/:id",
  CheckPermission("ProjectMangament", "id", Models.ProjectEmployee, "id"),
  validateIDparam,
  validateInputData,
  ProjectEmployeeController.getEmployee
);

module.exports = router;
