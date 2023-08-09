const express = require("express");
const { validateInputData } = require("../utils/Helpers");
const { Authenticate } = require("../middlewares/Auth");
const {
  validateCreateConversation,
  validateSendMessage,
  validateSendMessageFile,
  validateMessageSeen,
  Validatefile,
} = require("../validators/conversation");
const conversationController = require("../controllers/Conversation.controller");

const ChatFileS3 = require("../middlewares/ChatFileS3");

const router = express.Router();

router.use(Authenticate);

router.post(
  "/",
  validateCreateConversation,
  validateInputData,
  conversationController.createConversation
);

router.get("/", conversationController.getConversations);
router.get("/load-messages/", conversationController.loadMessages);
router.get("/noconversation-users", conversationController.getUsers);

router.post(
  "/send-message",
  validateSendMessage,
  validateInputData,
  conversationController.sendMessage
);
router.post(
  "/send-message-file",
  ChatFileS3.single("chatfile"),
  validateSendMessageFile,
  Validatefile,
  validateInputData,
  conversationController.sendMessageFile
);

router.patch(
  "/messages-seen",
  validateMessageSeen,
  validateInputData,
  conversationController.setMessagesSeen
);

module.exports = router;
