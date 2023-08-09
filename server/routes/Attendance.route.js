const express = require("express");
const { Authenticate, CheckPermission } = require("../middlewares/Auth");
const { validateInputData } = require("../utils/Helpers");
const AttendanceController = require("../controllers/Attendance.controller");
const router = express.Router();

router.post("/rfid-attendance", AttendanceController.rfidAttendance);
router.get("/rfid-attendance-time", AttendanceController.rfidAttendanceTime);

router.use(Authenticate);

router
  .route("/")
  .post(
    CheckPermission("attendanceMangament"),
    validateInputData,
    AttendanceController.addAttendance
  )
  .get(
    CheckPermission("attendanceMangament"),
    validateInputData,
    AttendanceController.getAttendance
  );

router.get(
  "/user-attendance",
  CheckPermission("attendanceMangament"),
  validateInputData,
  AttendanceController.getTodayDate
);

module.exports = router;
