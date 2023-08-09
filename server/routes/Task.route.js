const express = require("express");

const Models = require("../models");
const tasksController = require("../controllers/Task.controller");
const {
  Authenticate,
  CheckPermission,
  CheckTaskPermission,
} = require("../middlewares/Auth");

const {
  validateCreateTask,
  validateGetTasks,
  validateChangeStatus,
  validateIDparam, validateSprintQuery,
  // validateBulkCreationTask,
} = require("../validators/task");

const { validateInputData } = require("../utils/Helpers");
const router = express.Router();

router.use(Authenticate);

router.get(
  "/kanban-board/:projectId",
  validateGetTasks,
  validateInputData,
  CheckTaskPermission("taskMangament", "projectId", Models.Project),
  tasksController.getKanBanTasks
);

router.get(
  "/sprints",
  validateSprintQuery,
  validateInputData,
  // CheckTaskPermission("taskMangament", "projectId", Models.Project),
  tasksController.getSprints
);

router.get(
  "/project-progress/:projectId",
  validateGetTasks,
  validateInputData,
  CheckTaskPermission("taskMangament", "projectId", Models.Project),
  tasksController.getProgress
);

router.get(
  "/:projectId",
  validateGetTasks,
  validateInputData,
  CheckTaskPermission("taskMangament", "projectId", Models.Project),
  tasksController.getTasks
);

// router.get(
//   "/logs/:id",
//   CheckTaskPermission("taskMangament", "id", Models.Task),
//   validateIDparam,
//   validateInputData,
//   tasksController.getLogs
// );

router.patch(
  "/change-status/:id",
  CheckTaskPermission("taskMangament", "id", Models.Task),
  validateChangeStatus,
  validateInputData,
  tasksController.changeStatus
);

router.post(
  "/",
  validateCreateTask,
  validateInputData,
  CheckTaskPermission("taskMangament"),
  tasksController.createTask
);

// router.post(
//   "/bulkcreate-task",
//   validateBulkCreationTask,
//   validateInputData,
//   tasksController.createBulkTask
// );

router
  .route("/:id")
  .patch(
    CheckTaskPermission("taskMangament", "id", Models.Task),
    validateIDparam,
    validateInputData,
    tasksController.updateTask
  )
  .delete(
    CheckTaskPermission("taskMangament", "id", Models.Task),
    validateIDparam,
    validateInputData,
    tasksController.deleteTask
  );

module.exports = router;
