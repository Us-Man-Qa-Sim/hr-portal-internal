const express = require("express");
const { Authenticate, AuthorizeRoles } = require("../middlewares/Auth");
const { roles } = require("../configs/Constants");
const { validateInputData } = require("../utils/Helpers");
const SalaryController = require("../controllers/Salary.controller");
const {
  validateCreateSalary,
  validateIDparam,
  validateUserIDparam,
} = require("../validators/salary");

const router = express.Router();

router.use(Authenticate, AuthorizeRoles(roles.ADMIN, roles.EMPLOYEE));

router.get("/info", SalaryController.getLoggedUserSalary);

router.use(Authenticate, AuthorizeRoles(roles.ADMIN));

router
  .route("/")
  .get(SalaryController.getSalaries)
  .post(validateCreateSalary, validateInputData, SalaryController.CreateSalary);

router
  .route("/:id")
  .delete(validateIDparam, validateInputData, SalaryController.deleteSalary)
  .put(validateIDparam, validateInputData, SalaryController.updateSalary)
  .get(validateIDparam, validateInputData, SalaryController.getSalary);

router.get(
  "/get/:userId",
  validateUserIDparam,
  validateIDparam,
  SalaryController.getUserSalary
);
module.exports = router;
