const express = require("express");
const { validateInputData } = require("../utils/Helpers");
const { Authenticate, AuthorizeRoles } = require("../middlewares/Auth");
const { roles } = require("../configs/Constants");
const {
  validateAddDepartment,
  validatePaymentHeadtIdparam,
} = require("../validators/department");
const paymentHeadController = require("../controllers/PaymentHead.controller");

const router = express.Router();

router.use(Authenticate, AuthorizeRoles(roles.ADMIN));

router.post(
  "/",
  validateAddDepartment,
  validateInputData,
  paymentHeadController.addPaymentHead
);

router.get("/", paymentHeadController.getPaymentHeads);

router.delete(
  "/:id",
  validatePaymentHeadtIdparam,
  validateInputData,
  paymentHeadController.deletePaymentHead
);
router.put(
  "/:id",
  validatePaymentHeadtIdparam,
  validateInputData,
  paymentHeadController.updatePaymentHead
);

module.exports = router;
