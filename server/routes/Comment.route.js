const express = require("express");
const uploadS3 = require("../middlewares/UploadS3");
const commentsController = require("../controllers/Comment.controller");
const {
  Authenticate,
  CheckTaskCommunicationPermission,
} = require("../middlewares/Auth");
const {
  validateAddcomment,
  validateReplyToComment,
  validateReplyToIssue,
  validateIDparam,
  validateGetComment,
  ValidatePicture,
} = require("../validators/comment");
const { validateInputData } = require("../utils/Helpers");
const router = express.Router();
const Models = require("../models");
router.use(Authenticate);

router.get(
  "/:taskId",
  validateGetComment,
  validateInputData,
  CheckTaskCommunicationPermission(
    "taskCommunicationMangament",
    "taskId",
    Models.Task
  ),
  commentsController.getComments
);

router
  .route("/replies/:id")
  .get(
    validateIDparam,
    validateInputData,
    CheckTaskCommunicationPermission(
      "taskCommunicationMangament",
      "id",
      Models.Comment
    ),
    commentsController.getReplies
  );
// .patch(validateIDparam, validateInputData, commentsController.updateComment)
// .delete(validateIDparam, validateInputData, commentsController.deleteComment);

router.post(
  "/",
  validateAddcomment,
  validateInputData,
  CheckTaskCommunicationPermission("taskCommunicationMangament"),
  commentsController.addComment
);

router.post(
  "/add-file",
  uploadS3.array("files"),
  ValidatePicture,
  validateInputData,
  commentsController.addFile
);

router.post(
  "/reply-comment",
  validateReplyToComment,
  validateInputData,
  CheckTaskCommunicationPermission("taskCommunicationMangament"),
  commentsController.replyComment
);

router.post(
  "/reply-issue/:id",
  validateReplyToIssue,
  validateInputData,
  CheckTaskCommunicationPermission(
    "taskCommunicationMangament",
    "id",
    Models.Issue
  ),
  commentsController.replyIssue
);

module.exports = router;
