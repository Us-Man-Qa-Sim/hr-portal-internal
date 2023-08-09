const { Op, Model } = require("sequelize");

const Models = require("../models");
const AppError = require("../utils/AppError");
const CatchAsync = require("../utils/CatchAsync");
const Helpers = require("../utils/Helpers");

// GET NOTIFICATIONS
module.exports.getNotifications = CatchAsync(async (req, res, next) => {
  const { user } = req;

  let notifications = await Models.Notifies.findAll({
    where: {
      [Op.and]: [{ read: false, to: user.id }],
    },
    attributes: { exclude: ["notificationId", "from", "to"] },
    include: [
      {
        model: Models.Notification,
        foreignKey: "notificationId",
        as: "notification",
        attributes: { exclude: ["createdAt", "updatedAt"] },
      },
      {
        model: Models.User,
        foreignKey: "from",
        as: "sender",
        attributes: {
          exclude: ["password", "role", "leaves", "createdAt", "updatedAt"],
        },
      },
    ],
    order: [["createdAt", "DESC"]],
  });

  notifications = Helpers.convertToPlainJSObject(notifications);

  res.status(200).json({
    status: "success",
    message: "Notifications fetched successfully",
    data: {
      notifications,
    },
  });
});

// UPDATE NOTIFICATIONS
module.exports.updateNotifications = CatchAsync(async (req, res, next) => {
  const { user } = req;

  let checkNotificationsInDB = await Models.Notifies.findAll({
    where: {
      [Op.and]: [{ read: false, to: user.id }],
    },
  });
  if (!checkNotificationsInDB)
    return next(new AppError("Invalid ID. Notifications are not found", 404));

  await Models.Notifies.update(
    { read: true },
    {
      where: {
        [Op.and]: [{ read: false }, { to: user.id }],
      },
    }
  );

  res.status(200).json({
    status: "success",
    message: "All notifications are marked as read",
  });
});
