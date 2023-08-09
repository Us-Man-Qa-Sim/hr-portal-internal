const { check, param } = require("express-validator");

module.exports.validateCreateIncentive = [
  check("data.incentive").exists().withMessage("Incentive is required"),
  check("data.amount")
    .if(check("data.isPercentage").not().equals("true"))
    .exists()
    .withMessage("Incentive amount  is required"),
  check("data.type")
    .exists()
    .withMessage("Incentive Type  is required")
    .isIn(["INC", "DEC"])
    .withMessage("Incentive type must be INC or DEC"),
  check("data.month")
    .if(check("data.isMonthly").equals("true"))
    .exists()
    .withMessage("month is required if Incentive is Monthly"),
  check("data.percentage")
    .if(check("data.isPercentage").equals("true"))
    .exists()
    .withMessage("Percentage is required"),
];
module.exports.validateIDparam = [
  param("id").exists().withMessage("Incentive Id is required as param"),
];
