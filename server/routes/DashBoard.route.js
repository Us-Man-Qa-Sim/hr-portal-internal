const express = require("express");
const { Authenticate, CheckPermission } = require("../middlewares/Auth");
const dashBoardValidators = require('../validators/dashBoard')
const { validateInputData } = require("../utils/Helpers");
const DashBoardController = require("../controllers/DashBoard.controller");
const router = express.Router();

router.use(Authenticate);

router.get("/", DashBoardController.getDashboardData);
router.get("/admin", DashBoardController.getAdminDashboardData);
router.get("/lead",
    dashBoardValidators.validateQuery,
    validateInputData,
    DashBoardController.getLeadDashboardData);

// router.get("/get-time-spents", DashBoardController.getTimeSpents);
// router.get("/get-projects", DashBoardController.getPtojects);
// router.get("/get-team-absents", DashBoardController.getTeamAbsents);
// router.get("/get-tasks-statistics", DashBoardController.getTaskStatistics);
// router.get("/get-leaves-statistics", DashBoardController.getLeaveStatistics);

module.exports = router;
