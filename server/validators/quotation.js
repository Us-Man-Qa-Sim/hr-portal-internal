const { check, param, query, body } = require("express-validator");

module.exports.validateAddQuotation = [
  check("data.projectId")
    .exists()
    .withMessage("Project id  is required")
    .notEmpty()
    .withMessage("Project id  should not be empty")
    .notEmpty()
    .withMessage("Project id id  should not be empty"),
  check("data.clientId")
    .exists()
    .withMessage("Client id  is required")
    .notEmpty()
    .withMessage("Client id  should not be empty"),
  check("data.quotationDate")
    .exists()
    .withMessage("Quotation Date is required")
    .notEmpty()
    .withMessage("Quotation Date should not be empty")
    .isDate()
    .withMessage("Quotation Date should be date"),
  check("data.expiryDate")
    .exists()
    .withMessage("Expiry Date is required")
    .notEmpty()
    .withMessage("Expiry Date should not be empty")
    .isDate()
    .withMessage("Expiry Date should be date"),
  body("data.items")
    .exists()
    .withMessage("Items  is required")
    .isArray()
    .withMessage("Items must be a Array")
    .notEmpty()
    .withMessage("Items should not be empty"),
  body("data.items.*.itemName")
    .exists()
    .withMessage("Quotation item title is required ")
    .notEmpty()
    .withMessage("Quotation item title should not be empty"),
  body("data.items.*.description")
    .exists()
    .withMessage("Quotation item description is required ")
    .notEmpty()
    .withMessage("Quotation item description should not be empty"),
  body("data.items.*.unitCost")
    .exists()
    .withMessage("Quotation item unitCost is required ")
    .notEmpty()
    .withMessage("Quotation item unitCost should not be empty"),
  body("data.items.*.quantity")
    .exists()
    .withMessage("Quotation item quantity is required ")
    .notEmpty()
    .withMessage("Quotation item quantity should not be empty"),
];

module.exports.validateIdparam = [
  param("id").exists().withMessage("Id is required"),
];

module.exports.validateUpdateQuotation = [
  body("data.items")
    .if(body("data.items").notEmpty())
    .exists()
    .withMessage("Items  is required")
    .isArray()
    .withMessage("Items must be a Array"),
  body("data.items.*.itemName")
    .exists()
    .withMessage("Quotation item title is required ")
    .notEmpty()
    .withMessage("Quotation item title should not be empty"),
  body("data.items.*.description")
    .exists()
    .withMessage("Quotation item description is required ")
    .notEmpty()
    .withMessage("Quotation item description should not be empty"),
  body("data.items.*.unitCost")
    .exists()
    .withMessage("Quotation item unitCost is required ")
    .notEmpty()
    .withMessage("Quotation item unitCost should not be empty"),
  body("data.items.*.quantity")
    .exists()
    .withMessage("Quotation item quantity is required ")
    .notEmpty()
    .withMessage("Quotation item quantity should not be empty"),
];

module.exports.validateChangeQuotaionStatus = [
  check("data.status")
    .exists()
    .withMessage("status is required")
    .isIn(["Sent", "Accept", "Declined"])
    .withMessage("Status must be Sent or Accept or Declined"),
];
