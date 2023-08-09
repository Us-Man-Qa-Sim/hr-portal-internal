const express = require("express");
const { validateInputData } = require("../utils/Helpers");
const { Authenticate, CheckPermission } = require("../middlewares/Auth");

const DesignationController = require("../controllers/Designation.controller");

const {
  validateroleIDparam,
  validateIDparam,
  validateAddDesignation,
} = require("../validators/designation");
const { roles } = require("../configs/Constants");
const router = express.Router();

router.use(Authenticate);

router
  .route("/")
  .post(
    validateAddDesignation,
    CheckPermission("UserMangament"),
    validateInputData,
    DesignationController.addDesignation
  )
  .get(
    CheckPermission("UserMangament"),
    validateInputData,
    DesignationController.getdesignations
  );

router
  .route("/:id")
  .delete(
    validateIDparam,
    CheckPermission("UserMangament"),
    validateInputData,
    DesignationController.deleteDesignation
  )
  .patch(
    validateIDparam,
    CheckPermission("UserMangament"),
    validateInputData,
    DesignationController.updateDesignation
  )
  .put(
    validateIDparam,
    CheckPermission("UserMangament"),
    validateInputData,
    DesignationController.softDeleteDesignation
  );

module.exports = router;
