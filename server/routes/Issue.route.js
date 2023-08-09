const express = require("express");

const issueController = require("../controllers/Issue.controller");
const {
  Authenticate,
  CheckTaskCommunicationPermission,
} = require("../middlewares/Auth");
const {
  validateAddIssue,
  validateIDparam,
  validateGetIssues,
} = require("../validators/issue");
const { validateInputData } = require("../utils/Helpers");

const Models = require("../models");

const router = express.Router();

router.use(Authenticate);

router.post(
  "/",
  validateAddIssue,
  validateInputData,
  CheckTaskCommunicationPermission("taskCommunicationMangament"),
  issueController.addIssue
);

router.get(
  "/:taskId",
  validateGetIssues,
  validateInputData,
  CheckTaskCommunicationPermission(
    "taskCommunicationMangament",
    "taskId",
    Models.Task
  ),
  issueController.getIssue
);

router.get(
  "/issue-replies/:id",
  CheckTaskCommunicationPermission(
    "taskCommunicationMangament",
    "id",
    Models.Issue
  ),
  validateIDparam,
  validateInputData,
  issueController.issueReplies
);

// router.patch(
//   "/:id",
//   validateIDparam,
//   validateInputData,
//   issueController.updateIssue
// );

// router.delete(
//   "/:id",
//   validateIDparam,
//   validateInputData,
//   issueController.deleteIssue
// );
module.exports = router;
