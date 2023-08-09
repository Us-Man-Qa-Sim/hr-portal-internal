const { check, body } = require("express-validator");
const AppError = require("../utils/AppError");
module.exports.validateCreateConversation = [
  check("data.userId")
    .exists()
    .withMessage(
      "User should be entered with whom you want to create conversation"
    )
    .isNumeric()
    .withMessage("user id should be numeric"),
];

module.exports.validateSendMessage = [
  check("data.conversationId")
    .exists()
    .withMessage("Enter onversationId for sending message")
    .isNumeric()
    .withMessage("user id should be numeric"),
];

module.exports.validateSendMessageFile = [
  body("conversationId")
    .exists()
    .withMessage("Conversation Id is required")
    .isNumeric()
    .withMessage("Conversation Id should be numeric"),
];
module.exports.validateMessageSeen = [
  check("data.conversationId")
    .exists()
    .withMessage("Conversation Id is required")
    .isNumeric()
    .withMessage("Conversation Id should be numeric"),
];

module.exports.Validatefile = async (req, res, next) => {
  //we can also check file type here too

  if (!req.file) {
    console.log("checking the file");
    next(new AppError("File is required", 400));
  }
  next();
};
