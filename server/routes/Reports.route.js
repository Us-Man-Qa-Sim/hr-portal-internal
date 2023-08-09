const express = require("express");
const { validateInputData } = require("../utils/Helpers");
const { Authenticate, } = require("../middlewares/Auth");

const reportController = require("../controllers/Report.controller");

const validate = require("../validators/report");
const router = express.Router();

router.use(Authenticate);

router.get('/attendance-summary',
    validate.validateAttendanceSummaryQuery,
    validateInputData,
    reportController.getAttendanceSummary
)
router.get('/attendance-abnormal',
    validate.validateAttendanceSummaryQuery,
    validateInputData,
    reportController.getAttendanceAbnormal
)


module.exports = router;
