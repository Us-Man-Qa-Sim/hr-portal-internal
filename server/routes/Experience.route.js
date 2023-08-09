const express = require("express");
const { validateInputData } = require("../utils/Helpers");
const {
  validateAddExperience,
  validateIDparam,
} = require("../validators/experience");
const { Authenticate, CheckPermission } = require("../middlewares/Auth");
const ExperienceController = require("../controllers/Experience.controller");
const Models = require("../models");
const router = express.Router();

router.use(Authenticate);

router
  .route("/:id")
  .post(
    validateAddExperience,
    CheckPermission("userInfoMangament", "id", Models.User, "id"),
    validateInputData,
    ExperienceController.addExperience
  )
  .get(
    validateIDparam,
    CheckPermission("userInfoMangament", "id", Models.User, "id"),
    validateInputData,
    ExperienceController.getExperience
  )
  .delete(
    validateIDparam,
    CheckPermission("userInfoMangament", "id", Models.User, "id"),
    validateInputData,
    ExperienceController.deleteExperience
  );

module.exports = router;
