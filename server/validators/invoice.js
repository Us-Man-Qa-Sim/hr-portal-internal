const { check, param, query, body } = require("express-validator");

module.exports.validateAddInvoice = [
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
  check("data.invoiceDate")
    .exists()
    .withMessage("Invoice Date is required")
    .notEmpty()
    .withMessage("Invoice Date should not be empty")
    .isDate()
    .withMessage("Invoice Date should be date"),
  check("data.expiryDate")
    .exists()
    .withMessage("Expiry Date is required")
    .notEmpty()
    .withMessage("Expiry Date should not be empty")
    .isDate()
    .withMessage("Expiry Date should be date"),
  body("data.items")
    .exists()
    .withMessage("Invoice Items are required")
    .isArray()
    .withMessage("Invoice Items must be a Array")
    .notEmpty()
    .withMessage("Items should not be empty"),
  body("data.items.*.itemName")
    .exists()
    .withMessage("Invoice item title is required ")
    .notEmpty()
    .withMessage("Invoice item title should not be empty"),
  body("data.items.*.description")
    .exists()
    .withMessage("Invoice item description is required ")
    .notEmpty()
    .withMessage("Invoice item description should not be empty"),
  body("data.items.*.unitCost")
    .exists()
    .withMessage("Invoice item unitCost is required ")
    .notEmpty()
    .withMessage("Invoice item unitCost should not be empty"),
  body("data.items.*.quantity")
    .exists()
    .withMessage("Invoice item quantity is required ")
    .notEmpty()
    .withMessage("Invoice item quantity should not be empty"),
];

module.exports.validateIdparam = [
  param("id").exists().withMessage("Id is required"),
];

module.exports.validateUpdateInvoice = [
  body("data.items")
    .if(body("data.items").notEmpty())
    .exists()
    .withMessage("Invoice Items are required")
    .isArray()
    .withMessage("Invoice Items must be a Array"),
  body("data.items.*.itemName")
    .exists()
    .withMessage("Invoice item title is required ")
    .notEmpty()
    .withMessage("Invoice item title should not be empty"),
  body("data.items.*.description")
    .exists()
    .withMessage("Invoice item description is required ")
    .notEmpty()
    .withMessage("Invoice item description should not be empty"),
  body("data.items.*.unitCost")
    .exists()
    .withMessage("Invoice item unitCost is required ")
    .notEmpty()
    .withMessage("Invoice item unitCost should not be empty"),
  body("data.items.*.quantity")
    .exists()
    .withMessage("Invoice item quantity is required ")
    .notEmpty()
    .withMessage("Invoice item quantity should not be empty"),
];

module.exports.validatChangeInvoiceStatus = [
  check("data.status")
    .exists()
    .withMessage("status is required")
    .isIn(["Sent", "Accept", "Declined"])
    .withMessage("Status must be Sent or Accept or Declined"),
];
