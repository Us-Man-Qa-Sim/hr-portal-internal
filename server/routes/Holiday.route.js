const express = require("express");
const { validateInputData } = require("../utils/Helpers");
const { Authenticate, CheckPermission } = require("../middlewares/Auth");
const {
  validateAddHoliday,
  validateIDparam,
} = require("../validators/holiday");

const holidayController = require("../controllers/Holiday.controller");

const router = express.Router();

router.use(Authenticate);

router.post(
  "/",
  validateAddHoliday,
  CheckPermission("UserMangament"),
  validateInputData,
  holidayController.addHoliday
);

router.get("/", holidayController.getHolidays);

router.delete(
  "/:id",
  validateIDparam,
  CheckPermission("UserMangament"),
  validateInputData,
  holidayController.deleteHoliday
);
router.patch(
  "/:id",
  validateIDparam,
  CheckPermission("UserMangament"),
  validateInputData,
  holidayController.updateHoliday
);

module.exports = router;
