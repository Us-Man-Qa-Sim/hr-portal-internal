const express = require("express");
const { validateInputData } = require("../utils/Helpers");
const { Authenticate, AuthorizeRoles } = require("../middlewares/Auth");
const { roles } = require("../configs/Constants");
const {
  validateAddCredit,
  validateAddDebit,
  validatePaymentIdparam,
} = require("../validators/payment");

const paymentController = require("../controllers/Payment.controller");

const router = express.Router();

router.use(Authenticate, AuthorizeRoles(roles.ADMIN));

// router.post(
//   "/debit",
//   validateAddDebit,
//   validateInputData,
//   paymentController.addDebit
// );
// router.post(
//   "/credit",
//   validateAddCredit,
//   validateInputData,
//   paymentController.addCredit
// );

router
  .route("/credit")
  .get(paymentController.getCredits)
  .post(validateAddCredit, validateInputData, paymentController.addCredit);

router
  .route("/debit")
  .get(paymentController.getDebits)
  .post(validateAddDebit, validateInputData, paymentController.addDebit);

router.get("/", paymentController.getPayments);

router.delete(
  "/:id",
  validatePaymentIdparam,
  validateInputData,
  paymentController.deletePayment
);
router.put(
  "/credit/:id",
  validatePaymentIdparam,
  validateInputData,
  paymentController.updateCredit
);
router.put(
  "/debit/:id",
  validatePaymentIdparam,
  validateInputData,
  paymentController.updateDebit
);
module.exports = router;
