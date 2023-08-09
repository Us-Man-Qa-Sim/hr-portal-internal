const express = require("express");
const { validateInputData } = require("../utils/Helpers");
const {
  validateAddEducation,
  validateIDparam,
} = require("../validators/educationInformation");
const { Authenticate, CheckPermission } = require("../middlewares/Auth");
const EducationController = require("../controllers/EducationInformation.controller");
const Models = require("../models");
const router = express.Router();

router.use(Authenticate);

router
  .route("/:id")
  .post(
    validateAddEducation,
    CheckPermission("userInfoMangament", "id", Models.User, "id"),
    validateInputData,
    EducationController.addEducation
  )
  .get(
    validateIDparam,
    CheckPermission("userInfoMangament", "id", Models.User, "id"),
    validateInputData,
    EducationController.getEducation
  )
  .delete(
    validateIDparam,
    CheckPermission("userInfoMangament", "id", Models.Education, "userId"),
    validateInputData,
    EducationController.deleteEducation
  );

module.exports = router;
