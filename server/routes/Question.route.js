const express = require("express");
const { validateInputData } = require("../utils/Helpers");
const { Authenticate, AuthorizeRoles } = require("../middlewares/Auth");
const { roles } = require("../configs/Constants");
const {
  validateAddQuestion,
  validateQuestionIdparam,
  validateDepartmentId,
} = require("../validators/question");

const questionController = require("../controllers/Question.controller");

const router = express.Router();

router.use(Authenticate, AuthorizeRoles(roles.ADMIN));

router.post(
  "/",
  validateAddQuestion,
  validateInputData,
  questionController.addQuestion
);

router.get("/", questionController.getQuestions);
router.get(
  "/department-question",
  validateDepartmentId,
  validateInputData,
  questionController.getDepartmentQuestions
);

router.put(
  "/:id",
  validateQuestionIdparam,
  validateInputData,
  questionController.updateQuestion
);

module.exports = router;
