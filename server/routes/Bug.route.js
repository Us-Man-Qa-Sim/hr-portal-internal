const express = require("express");

const bugController = require("../controllers/Bug.controller");
const { Authenticate, CheckBugPermission } = require("../middlewares/Auth");

const {
  validateCreateBug,
  validateChangeStatus,
  validateChangeEmployee,
  validateIDparam,
} = require("../validators/bug");

const { validateInputData } = require("../utils/Helpers");
const router = express.Router();

router.use(Authenticate);

router.post(
  "/",
  validateCreateBug,
  validateInputData,
  CheckBugPermission("taskMangament"),
  bugController.createBug
);

router.get(
  "/:id",
  CheckBugPermission("taskMangament"),
  validateIDparam,
  validateInputData,
  bugController.getBugs
);

router.put(
  "/change-status/:id",
  CheckBugPermission("taskMangament"),
  validateChangeStatus,
  validateInputData,
  bugController.changeBugStatus
);
router.patch(
  "/assign/:id",
  CheckBugPermission("taskMangament"),
  validateIDparam,
  validateChangeEmployee,
  validateInputData,
  bugController.assignEmployeeToBug
);

router
  .route("/:id")
  .patch(
    CheckBugPermission("taskMangament"),
    validateIDparam,
    validateInputData,
    bugController.updatebug
  )
  .delete(
    CheckBugPermission("taskMangament"),
    validateIDparam,
    validateInputData,
    bugController.deleteBug
  );

module.exports = router;
