const express = require("express");
const { validateInputData } = require("../utils/Helpers");
const {
  validateAddEmergencyContact,
  validateIDparam,
  validateparam,
} = require("../validators/emergencyContact");
const { Authenticate, CheckPermission } = require("../middlewares/Auth");
const EmergencyContactController = require("../controllers/EmergencyContact.controller");
const Models = require("../models");
const router = express.Router();

router.use(Authenticate);

router
  .route("/:id")
  .post(
    validateAddEmergencyContact,
    CheckPermission("userInfoMangament", "id", Models.User, "id"),
    validateInputData,
    EmergencyContactController.addEmergencyContact
  )
  .get(
    validateIDparam,
    CheckPermission("userInfoMangament", "id", Models.User, "id"),
    validateInputData,
    EmergencyContactController.getEmergencyContact
  )
  .patch(
    validateparam,
    CheckPermission("userInfoMangament", "id", Models.User, "id"),
    validateInputData,
    EmergencyContactController.updateEmergencyContact
  );

module.exports = router;
