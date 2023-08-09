const express = require("express");
const { validateInputData } = require("../utils/Helpers");
const { Authenticate, AuthorizeRoles } = require("../middlewares/Auth");

const RoleController = require("../controllers/Role.controller");

const { validateAddRole, validateIDparam } = require("../validators/role");
const { roles } = require("../configs/Constants");
const router = express.Router();

router.use(Authenticate);

router
  .route("/")
  .post(validateAddRole, validateInputData, RoleController.addRole)
  .get(RoleController.getRoles);

router
  .route("/:id")
  .delete(validateIDparam, validateInputData, RoleController.deleteRole)
  .patch(validateIDparam, validateInputData, RoleController.updateRole)
  .put(validateIDparam, validateInputData, RoleController.softDeleteRole);

module.exports = router;
