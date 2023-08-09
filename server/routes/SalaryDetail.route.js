const express = require("express");
const { Authenticate, AuthorizeRoles } = require("../middlewares/Auth");
const { roles } = require("../configs/Constants");
const { validateInputData } = require("../utils/Helpers");
const SalaryDetailController = require("../controllers/SalaryDetail.controller");
const {
  validateCreateSalaryDetail,
  validateIDparam,
} = require("../validators/salary");
const router = express.Router();

router.use(Authenticate, AuthorizeRoles(roles.ADMIN));

router
  .route("/")
  .post(
    validateCreateSalaryDetail,
    validateInputData,
    SalaryDetailController.createSalaryDetail
  )
  .get(SalaryDetailController.getSalaryDetails);

router
  .route("/:id")
  .delete(
    validateIDparam,
    validateInputData,
    SalaryDetailController.deleteSalaryDetail
  );
// .put(SalaryDetailController.updateSalary)
// .get(SalaryDetailController.getSalary);

module.exports = router;
