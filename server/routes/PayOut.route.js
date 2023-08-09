const express = require("express");
const { validateInputData } = require("../utils/Helpers");
const { Authenticate, AuthorizeRoles } = require("../middlewares/Auth");
const { validateIDparam } = require("../validators/account");
const PayOutController = require("../controllers/PayOut.controller");

const router = express.Router();

router.use(Authenticate, AuthorizeRoles(roles.ADMIN));

router.put("/update/:id", validateIDparam, validateInputData, PayOutController);
router.delete(
  "/update/:id",
  validateIDparam,
  validateInputData,
  PayOutController
);

module.exports = router;
