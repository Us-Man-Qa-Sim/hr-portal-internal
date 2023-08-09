const express = require("express");
const { Authenticate } = require("../middlewares/Auth");
const { validateInputData } = require("../utils/Helpers");
const {
  validateAddEmployeeSalary,
  validateIdParam,
} = require("../validators/employeeSalary");
const employeeSalaryController = require("../controllers/EmployeeSalary.controller");
const router = express.Router();

router.use(Authenticate);

router
  .route("/")
  .post(
    // CheckPermission("attendanceMangament"),
    validateAddEmployeeSalary,
    validateInputData,
    employeeSalaryController.addEmployeeSalary
  )
  .get(
    // CheckPermission("attendanceMangament"),
    validateInputData,
    employeeSalaryController.getEmployeeSalary
  );

router.patch(
  "/:id",
  // CheckPermission("attendanceMangament"),
  validateIdParam,
  validateInputData,
  employeeSalaryController.updateEmployeeSalary
);
router.delete(
  "/:id",
  // CheckPermission("attendanceMangament"),
  validateIdParam,
  validateInputData,
  employeeSalaryController.deleteItem
);
router.get(
  "/:id",
  // CheckPermission("attendanceMangament"),
  validateIdParam,
  validateInputData,
  employeeSalaryController.employeeSalaryInfo
);
router.get(
  "/create-pdf/:id",
  // CheckPermission("attendanceMangament"),
  validateIdParam,
  validateInputData,
  employeeSalaryController.employeeSalaryPdf
);

module.exports = router;
