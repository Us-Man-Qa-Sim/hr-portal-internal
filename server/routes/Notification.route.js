const express = require("express");

const notificationController = require("../controllers/Notification.controller");
const { Authenticate, AuthorizeRoles } = require("../middlewares/Auth");
const { roles } = require("../configs/Constants");

const router = express.Router();

router.use(Authenticate);
router.get("/", notificationController.getNotifications);
router.patch("/", notificationController.updateNotifications);

module.exports = router;
