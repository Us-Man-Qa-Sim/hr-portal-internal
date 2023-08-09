const express = require("express");
const { Authenticate, AuthorizeRoles } = require("../middlewares/Auth");
const { roles } = require("../configs/Constants");
const { validateInputData } = require("../utils/Helpers");
const IncentiveController = require("../controllers/Incentive.controller");
const {
  validateCreateIncentive,
  validateIDparam,
} = require("../validators/incentive");

const router = express.Router();

router
  .route("/")
  .get(IncentiveController.getIncentives)
  .post(
    validateCreateIncentive,
    validateInputData,
    IncentiveController.createIncentive
  );
router
  .route("/:id")
  .delete(
    validateIDparam,
    validateInputData,
    IncentiveController.deleteIncentive
  )
  .put(validateIDparam, validateInputData, IncentiveController.updateIncentive)
  .get(validateIDparam, validateInputData, IncentiveController.getIncentive);

module.exports = router;
