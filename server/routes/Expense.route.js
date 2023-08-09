const express = require("express");
const uploadS3 = require("../middlewares/UploadS3");
const expenseController = require("../controllers/Expense.controller");
const { Authenticate, CheckPermission } = require("../middlewares/Auth");
const Models = require("../models");
const {
  validateAddExpense,
  ValidateAttachments,
  validateChangeExpenseStatus,
  validateIDparam,
} = require("../validators/expense");
const { validateInputData } = require("../utils/Helpers");
const router = express.Router();

router.use(Authenticate);

router.post(
  "/",
  CheckPermission("UserMangament"),
  uploadS3.array("files"),
  validateAddExpense,
  ValidateAttachments,
  validateInputData,
  expenseController.addExpense
);

router.get(
  "/",
  CheckPermission("UserMangament"),
  validateInputData,
  expenseController.getExpenses
);

router.delete(
  "/:id",
  CheckPermission("UserMangament"),
  validateIDparam,
  validateInputData,
  expenseController.deleteExpense
);

router.put(
  "/:id",
  CheckPermission("UserMangament"),
  validateIDparam,
  validateChangeExpenseStatus,
  validateInputData,
  expenseController.changeExpenseStatus
);

router.patch(
  "/:id",
  CheckPermission("UserMangament"),
  validateIDparam,
  validateInputData,
  expenseController.updateExpense
);

module.exports = router;
