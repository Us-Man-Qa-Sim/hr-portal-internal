const { check, param } = require("express-validator");

module.exports.validateAddDebit = [
  check("data.paymentType")
    .exists()
    .withMessage("Payment type is required")
    .equals("Debit")
    .withMessage("Payment type must be Debit"),

  check("data.debitType")
    .exists()
    .withMessage("Debit Type  is required")
    .isIn(["B2B", "B2C"])
    .withMessage("Payment type must be B2C or B2B"),

  check("data.projectId")
    .exists()
    .withMessage("Project Id is required")
    .isNumeric()
    .withMessage("Project Id must be a numeric value"),

  check("data.amount")
    .exists()
    .withMessage("Amount is required")
    .isNumeric()
    .withMessage("Amount is requird in numeric form only"),

  check("data.date")
    .exists()
    .withMessage("Date is required")
    .isDate()
    .withMessage("Date must be a form of date"),
];

module.exports.validateAddCredit = [
  check("data.paymentType")
    .exists()
    .withMessage("Payment type is required")
    .equals("Credit")
    .withMessage("Payment type must be Credit"),

  check("data.amount")
    .exists()
    .withMessage("Amount is required")
    .isNumeric()
    .withMessage("Amount is requird in numeric form only"),

  check("data.paymentHeadId")
    .exists()
    .withMessage("PaymentHead Id is required")
    .isNumeric()
    .withMessage("paymentHead Id must be numeric value"),

  check("data.date")
    .exists()
    .withMessage("Date is required")
    .isDate()
    .withMessage("Date must be a form of date"),
];

module.exports.validatePaymentIdparam = [
  param("id")
    .exists()
    .withMessage("Payment Id is required as param")
    .isNumeric()
    .withMessage("Payment Id must be a numeric value"),
];
