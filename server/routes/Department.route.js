const express = require("express");
const { validateInputData } = require("../utils/Helpers");
const { Authenticate, AuthorizeRoles } = require("../middlewares/Auth");
const { roles } = require("../configs/Constants");
const {
  validateAddDepartment,
  validateDepartmentIdparam,
} = require("../validators/department");
const depatmentController = require("../controllers/Department.controller");

const router = express.Router();

router.use(Authenticate);

router.post(
  "/",
  validateAddDepartment,
  validateInputData,
  depatmentController.addDepartment
);

router.get("/", depatmentController.getDepartments);

router.delete(
  "/:id",
  validateDepartmentIdparam,
  validateInputData,
  depatmentController.deleteDepartment
);
router.put(
  "/:id",
  validateDepartmentIdparam,
  validateInputData,
  depatmentController.updateDepartment
);

module.exports = router;
