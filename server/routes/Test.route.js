const express = require("express");
const { validateInputData } = require("../utils/Helpers");
const { Authenticate, AuthorizeRoles } = require("../middlewares/Auth");
const { roles } = require("../configs/Constants");
const {
  validateCreateTest,
  validateAssignTest,
  validateToken,
  validateSubmit,
  validateTestId,
  validateTestAnswer,
} = require("../validators/test");
const testController = require("../controllers/Test.controller");

const router = express.Router();

router.use(Authenticate, AuthorizeRoles(roles.ADMIN));

router.post(
  "/",
  validateCreateTest,
  validateInputData,
  testController.createTest
);
router.get("/", testController.getSubmittedTests);
router.post(
  "/assign-users",
  validateAssignTest,
  validateInputData,
  testController.assignUsers
);

router.get(
  "/test-questions/:id",
  validateToken,
  validateInputData,
  testController.getTestQuestions
);

router.post(
  "/test-answers/:id",
  validateSubmit,
  validateInputData,
  testController.createAnswers
);

router.get(
  "/answers",
  validateTestAnswer,
  validateInputData,
  testController.getTestAnswer
);
router.get(
  "/users/:id",
  validateTestId,
  validateInputData,
  testController.getTestUsers
);
module.exports = router;
