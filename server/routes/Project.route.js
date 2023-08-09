const express = require("express");

const projectsController = require("../controllers/Project.controller");
const { Authenticate, CheckPermission } = require("../middlewares/Auth");
const Models = require("../models");
const {
  validateAddProject,
  validateIDparam,
  validateProjectIdparam,
  validateProjectQuery
} = require("../validators/project");
const { validateInputData } = require("../utils/Helpers");
const router = express.Router();

router.use(Authenticate);

router.get(
  "/",
  CheckPermission("ProjectMangament"),
  validateProjectQuery,
  validateInputData,
  projectsController.getProjects
);

router.get(
  "/clients",
  // CheckPermission("UserMangament"),
  CheckPermission("ProjectMangament"),
  projectsController.getClients
);

router.get(
  "/project-statuses",
  CheckPermission("ProjectMangament"),
  validateInputData,
  projectsController.getProjectStatuses
);

router.get(
  "/search",
  CheckPermission("ProjectMangament"),
  validateInputData,
  projectsController.searchProjects
);

router.get(
  "/:projectId",
  CheckPermission("ProjectMangament", "projectId", Models.Project, "id"),
  validateProjectIdparam,
  validateInputData,
  projectsController.getProject
);

router
  .route("/")
  .post(
    CheckPermission("ProjectMangament"),
    validateAddProject,
    validateInputData,
    projectsController.addProject
  );

router.get(
  "/unassigned/employess/:projectId",
  CheckPermission("ProjectMangament"),
  validateProjectIdparam,
  validateInputData,
  projectsController.getUnassignedEmployees
);

router.get(
  "/unassigned/leads/:projectId",
  CheckPermission("ProjectMangament"),
  validateProjectIdparam,
  validateInputData,
  projectsController.getUnassignedLeads
);

router
  .route("/:id")
  .delete(
    CheckPermission("ProjectMangament", "id", Models.Project, "id"),
    validateIDparam,
    validateInputData,
    projectsController.deleteProject
  )
  .patch(
    CheckPermission("ProjectMangament", "id", Models.Project, "id"),
    validateIDparam,
    validateInputData,
    projectsController.updateProject
  );

module.exports = router;
