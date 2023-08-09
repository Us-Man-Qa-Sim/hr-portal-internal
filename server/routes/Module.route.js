const express = require("express");
const { validateInputData } = require("../utils/Helpers");
const { Authenticate, AuthorizeRoles } = require("../middlewares/Auth");

const ModuleController = require("../controllers/Module.controller");

const { validateAddModule, validateIDparam } = require("../validators/module");
const { roles } = require("../configs/Constants");
const router = express.Router();

//router.use(Authenticate);

router
  .route("/")
  .post(
    Authenticate,
    validateAddModule,
    validateInputData,
    ModuleController.addModule
  )
  .get(ModuleController.getModules);

router
  .route("/:id")
  .delete(
    Authenticate,
    validateIDparam,
    validateInputData,
    ModuleController.deleteModule
  )
  .patch(
    Authenticate,
    validateIDparam,
    validateInputData,
    ModuleController.updateModule
  )
  .put(
    Authenticate,
    validateIDparam,
    validateInputData,
    ModuleController.softDeleteModule
  );

module.exports = router;
