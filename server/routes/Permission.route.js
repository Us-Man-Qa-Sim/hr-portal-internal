const express = require("express");
const { validateInputData } = require("../utils/Helpers");
const { Authenticate, AuthorizeRoles } = require("../middlewares/Auth");
const {
  validateAddPermission,
  validateIDparam,
} = require("../validators/permission");
const permissionController = require("../controllers/Permission.controller");
const { roles } = require("../configs/Constants");

const router = express.Router();

router.get("/", permissionController.getpermissions);

router.post(
  "/",
  Authenticate,
  validateAddPermission,
  validateInputData,
  permissionController.addPermission
);

router.patch(
  "/:id",
  Authenticate,
  validateIDparam,
  validateInputData,
  permissionController.updatePermission
);
// router.get("/", BankController.getBanks);

module.exports = router;
