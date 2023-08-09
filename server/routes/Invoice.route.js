const express = require("express");
const { validateInputData } = require("../utils/Helpers");
const { Authenticate } = require("../middlewares/Auth");
const { roles } = require("../configs/Constants");
const {
  validateAddInvoice,
  validateIdparam,
  validateUpdateInvoice,
  validatChangeInvoiceStatus,
} = require("../validators/invoice");

const invoiceController = require("../controllers/Invoice.controller");

const router = express.Router();

router.use(Authenticate);

router.post(
  "/",
  validateAddInvoice,
  validateInputData,
  invoiceController.addInvoice
);

router.get("/", invoiceController.getInvoices);

router.get(
  "/:id",
  validateIdparam,
  validateInputData,
  invoiceController.getInvoiceInfo
);
router.get(
  "/invoice-pdf/:id",
  validateIdparam,
  validateInputData,
  invoiceController.getInvoicePDF
);

router.delete(
  "/:id",
  validateIdparam,
  validateInputData,
  invoiceController.deleteItem
);

router.patch(
  "/:id",
  validateIdparam,
  validateUpdateInvoice,
  validateInputData,
  invoiceController.updateInvoice
);

router.put(
  "/:id",
  validateIdparam,
  validatChangeInvoiceStatus,
  validateInputData,
  invoiceController.changeInvoiceStatus
);

module.exports = router;
