const express = require("express");

const Models = require("../models");
const clientTaskController = require("../controllers/ClientTaskBoard.controller");
const { Authenticate, CheckPermission } = require("../middlewares/Auth");

const {
  validateCreateTask,
  validateGetTasks,
  validateChangeStatus,
  validateIDparam,
} = require("../validators/clientTask");
const { validateInputData } = require("../utils/Helpers");
const router = express.Router();

router.use(Authenticate);

router.get(
  "/kanban-board/:projectId",
  validateGetTasks,
  validateInputData,
  CheckPermission("ClientBoardMangament"),
  clientTaskController.getClientKanBanTasks
);

router.get(
  "/:projectId",
  validateGetTasks,
  validateInputData,
  CheckPermission("ClientBoardMangament"),
  clientTaskController.getClientTasks
);

router.patch(
  "/change-status/:id",
  validateChangeStatus,
  CheckPermission("ClientBoardMangament"),
  validateInputData,
  clientTaskController.changeClientStatus
);

router.post(
  "/",
  validateCreateTask,
  CheckPermission("ClientBoardMangament"),
  validateInputData,
  clientTaskController.createClientTask
);

router
  .route("/:id")
  .patch(
    validateIDparam,
    CheckPermission("ClientBoardMangament"),
    validateInputData,
    clientTaskController.updateClientTask
  )
  .delete(
    validateIDparam,
    CheckPermission("ClientBoardMangament"),
    validateInputData,
    clientTaskController.deleteClientTask
  );

module.exports = router;
