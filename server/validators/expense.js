const { check, param, body, query } = require("express-validator");

const AppError = require("../utils/AppError");

module.exports.validateAddExpense = [
  body("itemName")
    .if(query("expenseId").not().exists())
    .exists()
    .withMessage("Expense item name is required"),
  body("purchaseFrom")
    .if(query("expenseId").not().exists())
    .exists()
    .withMessage("purchaseFrom is required"),
  body("purchaseDate")
    .if(query("expenseId").not().exists())
    .exists()
    .withMessage("purchaseDate is required")
    .isDate()
    .withMessage("purchaseDate must be date"),
  body("purchasedBy")
    .if(query("expenseId").not().exists())
    .exists()
    .withMessage("purchasedBy is required"),
  body("amount")
    .if(query("expenseId").not().exists())
    .exists()
    .withMessage("amount is required"),
  body("paidBy")
    .if(query("expenseId").not().exists())
    .exists()
    .withMessage("paidBy is required"),
];
module.exports.validateAddDocument = [
  body("projectId").exists().withMessage("Project Id is required"),
];

module.exports.validateChangeExpenseStatus = [
  check("data.status")
    .exists()
    .withMessage("status is required")
    .isIn(["Approved", "Pending", "Declined"])
    .withMessage("Status must be Approved or Pending or Declined"),
];

module.exports.validateIDparam = [
  param("id").exists().withMessage("Expense Id is required as param"),
];

module.exports.ValidateAttachments = async (req, res, next) => {
  if (!req.files || req.files.length === 0) {
    next(new AppError("Attachment files are required", 405));
  }

  req.files?.map((file) => {
    console.log(file.mimetype);
    if (
      file.mimetype === "image/png" ||
      file.mimetype === "image/jpeg" ||
      file.mimetype === "application/pdf"
    ) {
    } else next(new AppError("Only PNG,JPEG and PDF formats are allowed", 405));
  });

  next();
};
