const express = require("express");
const { validateInputData } = require("../utils/Helpers");
const { Authenticate } = require("../middlewares/Auth");
const { roles } = require("../configs/Constants");
const {
  validateAddQuotation,
  validateIdparam,
  validateUpdateQuotation,
  validateChangeQuotaionStatus,
} = require("../validators/quotation");

const quotationController = require("../controllers/Quotation.controller");

const router = express.Router();

router.use(Authenticate);

router.post(
  "/",
  validateAddQuotation,
  validateInputData,
  quotationController.addQuotation
);

router.get("/", quotationController.getQuotations);

router.get(
  "/:id",
  validateIdparam,
  validateInputData,
  quotationController.getQuotationInfo
);

router.delete(
  "/:id",
  validateIdparam,
  validateInputData,
  quotationController.deleteItem
);

router.patch(
  "/:id",
  validateIdparam,
  validateUpdateQuotation,
  validateInputData,
  quotationController.updateQuotation
);

router.put(
  "/:id",
  validateIdparam,
  validateChangeQuotaionStatus,
  validateInputData,
  quotationController.changeQuotationStatus
);

module.exports = router;
