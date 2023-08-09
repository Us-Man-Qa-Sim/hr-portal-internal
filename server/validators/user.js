const { check, param, query } = require("express-validator");
const { roleIds } = require("../configs/Constants");
const AppError = require("../utils/AppError");
module.exports.validateLogin = [
  check("data.email")
    .exists()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Email must be a valid email"),
  check("data.password").exists().withMessage("Password is required"),
];

module.exports.validateAddUser = [
  check("data.name").exists().withMessage("Name is required"),
  check("data.email")
    .exists()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Email must be a valid Email"),
  check("data.password")
    .exists("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
  check("data.roleId").exists().withMessage("Role ID is required"),
  check("data.designationId")
    .if(check("data.roleId").equals(roleIds[1]))
    .exists()
    .withMessage("designation Id required"),
  check("data.jobStatus")
    .if(check("data.roleId").equals(roleIds[1]))
    .exists()
    .withMessage("Job status is required")
    .isIn(["Probation", "Permanent", 'Internship'])
    .withMessage("Job status must be one of [Permanent, Probation, Internship] "),
];

module.exports.validateDeleteAndUpdateUser = [
  param("id").exists().withMessage("User Id is required as param"),
];
module.exports.validateDeleteAndUpdateLeaveSetting = [
  param("id").exists().withMessage("Leave Setting Id is required as param"),
];

module.exports.validateChangeStatusLeave = [
  param("leaveId").exists().withMessage("Leave Id is required as param"),
  check("data.status")
    .exists()
    .withMessage("Status is required")
    .isIn(["Pending", "Approved", "Declined"])
    .withMessage("Status must be on of [Pending, Approved, Declined]"),
];

module.exports.validateUpdateLeave = [
  param("leaveId")
    .exists()
    .withMessage("Leave Id is required as param")
    .notEmpty()
    .withMessage("Leave Id should not be emppty"),
];
module.exports.validateApplyForLeave = [
  check("data.leaveType").exists().withMessage("leaveType is required"),
  check("data.from").exists().withMessage("From date is required"),
  check("data.to").exists().withMessage("To date is required"),
  check("data.reason").exists().withMessage("Reason is required"),
];

module.exports.validateLeaveSettings = [
  check("data.annual")
    .exists()
    .withMessage("Annual Leaves are required")
    .notEmpty()
    .withMessage("Anuual Leaves must not be empty"),
  check("data.casual")
    .exists()
    .withMessage("Casual Leaves are required")
    .notEmpty()
    .withMessage("Casual Leaves must not be empty"),
  check("data.medical")
    .exists()
    .withMessage("Medical Leaves are required")
    .notEmpty()
    .withMessage("Medical Leaves must not be empty"),
];

module.exports.ValidatePicture = async (req, res, next) => {
  //we can also check file type here too
  if (!req.files || req.files.length == 0) {
    // console.log("checking the file");
    next(new AppError("File is required", 400));
  }

  req.files?.map((file) => {
    if (file.mimetype == "image/jpeg" || file.mimetype == "image/png") {
    } else next(new AppError("Only PNG and JPEG are allowed", 400));
  });

  next();
  // if (mimetype == "image/jpeg" || mimetype == "image/png") next();
  // else next(new AppError("Only PNG and JPEG are allowed", 400));
};

module.exports.validateGetLeaveQuery = [
  query('year').optional().isNumeric().withMessage('year should be valid Numeric')
]