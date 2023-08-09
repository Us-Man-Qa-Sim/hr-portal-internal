const { Op } = require("sequelize");

const Models = require("../models");
const AppError = require("../utils/AppError");
const CatchAsync = require("../utils/CatchAsync");
const { conversationTypes } = require("../configs/Constants");
const Helpers = require("../utils/Helpers");

module.exports.createConversation = CatchAsync(async (req, res, next) => {
  const {
    user,
    body: { data },
  } = req;

  const checkInDB = await Models.Conversation.findOne({
    where: {
      [Op.or]: [
        { conversationMember1: user.id, conversationMember2: data.userId },
        { conversationMember1: data.userId, conversationMember2: user.id },
      ],
      conversationType: conversationTypes.SINGLE,
    },
  });

  if (checkInDB) console.log("found");
  if (checkInDB)
    return next(
      new AppError("User is already into your conversation list", 400)
    );

  let conversationCreated = await Models.Conversation.create({
    conversationType: conversationTypes.SINGLE,
    conversationMember1: user.id,
    conversationMember2: data.userId,
  });

  conversationCreated = Helpers.convertToPlainJSObject(conversationCreated);

  let conversation = await Models.Conversation.findOne({
    where: {
      id: conversationCreated.id,
    },
    attributes: { exclude: ["conversationMember1", "conversationMember2"] },
    include: [
      {
        model: Models.User,
        as: "member1",
        attributes: ["id", "name"],
      },
      {
        model: Models.User,
        as: "member2",
        attributes: ["id", "name"],
      },
      {
        model: Models.Message,
        as: "messages",
        limit: 10,
        order: [["createdAt", "desc"]],
      },
    ],
  });

  conversation = Helpers.convertToPlainJSObject(conversation);

  conversation.messages.reverse();

  res.status(200).json({
    status: "Success",
    message: "Conversation created successfully",
    data: {
      conversation,
    },
  });
});

module.exports.getConversations = CatchAsync(async (req, res, next) => {
  const { user } = req;

  let conversations = await Models.Conversation.findAll({
    where: {
      [Op.or]: { conversationMember1: user.id, conversationMember2: user.id },
    },
    attributes: { exclude: ["conversationMember1", "conversationMember2"] },
    include: [
      {
        model: Models.User,
        as: "member1",
        attributes: ["id", "name"],
        required: true,
        where: { deleted: false },
      },
      {
        model: Models.User,
        as: "member2",
        attributes: ["id", "name"],
        required: true,
        where: { deleted: false },
      },

      {
        model: Models.Message,
        as: "messages",
        limit: 10,
        order: [["createdAt", "desc"]],
      },
    ],
    order: [["lastMessageTime", "desc"]],
  });

  conversations = Helpers.convertToPlainJSObject(conversations);

  conversations.map((chat) => {
    const { member1, member2 } = chat;
    console.log(`Member1 is ${member1.id} and Member2 is ${member2.id}`);
  });

  conversations.map((item) => {
    item.messages.reverse();
  });

  res.status(200).json({
    status: "Success",
    message: "Conversations fetched successfully",
    data: {
      conversations,
    },
  });
});

module.exports.sendMessage = CatchAsync(async (req, res, next) => {
  const {
    user,
    body: { data },
  } = req;

  let message = await Models.Message.create({
    conversationId: data.conversationId,
    senderId: user.id,
    message: data.message,
  });

  message = Helpers.convertToPlainJSObject(message);

  await Models.Conversation.update(
    {
      lastMessageTime: message.createdAt,
    },
    { where: { id: data.conversationId } }
  );

  res.status(200).json({
    status: "Success",
    message: "Message send successfully",
    data: {
      message,
    },
  });
});

module.exports.sendMessageFile = CatchAsync(async (req, res, next) => {
  const { user } = req;
  // console.log(req.file);
  const { location } = req.file;
  //console.log(req.body);
  const { conversationId } = req.body;

  let message = await Models.Message.create({
    conversationId: conversationId,
    senderId: user.id,
    fileUrl: location,
  });

  message = Helpers.convertToPlainJSObject(message);

  await Models.Conversation.update(
    {
      lastMessageTime: message.createdAt,
    },
    { where: { id: conversationId } }
  );

  res.status(200).json({
    status: "Success",
    message: "File send successfully",
    data: {
      message,
    },
  });
});

module.exports.setMessagesSeen = CatchAsync(async (req, res, next) => {
  const {
    user,
    body: { data },
  } = req;

  console.log("is I'm true", user);
  await Models.Message.update(
    {
      read: true,
    },
    {
      where: {
        conversationId: data.conversationId,
        read: false,
        [Op.not]: { senderId: user.id },
      },
    }
  );

  res.status(200).json({
    status: "Success",
    message: "Seen receipt set to true",
  });
});

module.exports.loadMessages = CatchAsync(async (req, res, next) => {
  const { query } = req;
  const conversationId = query.id;
  const limit = query.limit ? query.limit : 10;
  const page = query.page ? query.page : 1;

  let messages = await Models.Message.findAll({
    where: {
      conversationId: conversationId,
    },
    limit: limit,
    offset: (page - 1) * limit,
    order: [["createdAt", "desc"]],
  });

  messages = Helpers.convertToPlainJSObject(messages);

  messages.reverse();

  res.status(200).json({
    status: "Success",
    message: "Messages Loaded successfully",
    conversationId: conversationId,
    data: {
      messages,
    },
  });
});

module.exports.getUsers = CatchAsync(async (req, res, next) => {
  const { user } = req;

  let conversations = await Models.Conversation.findAll({
    where: {
      [Op.or]: { conversationMember1: user.id, conversationMember2: user.id },
    },
    attributes: ["conversationMember1", "conversationMember2"],
  });

  //console.log(conversations);

  let users = [];
  if (conversations) {
    conversations.map((chat) => {
      if (user.id === chat.conversationMember1) {
        users.push(chat.conversationMember2);
      }
      if (user.id === chat.conversationMember2) {
        users.push(chat.conversationMember1);
      }
    });
  }

  let usersList = await Models.User.findAll({
    where: { id: { [Op.notIn]: users }, deleted: false },
    attributes: ["id", "name", "email", "role"],
  });
  return res.status(200).json({
    status: "success",
    message:
      "Users which have no conversation with logged user are fetched successfully",
    data: {
      usersList,
    },
  });
});
