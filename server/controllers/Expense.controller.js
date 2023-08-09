const Models = require("../models");
const AppError = require("../utils/AppError");
const CatchAsync = require("../utils/CatchAsync");
const Helpers = require("../utils/Helpers");
const Paginate = require("../utils/Paginate");
const urlencode = require("urlencode");
const { Op, fn, where, col } = require("sequelize");

module.exports.addExpense = CatchAsync(async (req, res, next) => {
  const { expenseId } = req.query;

  const files = req.files;

  if (expenseId) {
    const checkExpenseInDB = await Models.Expense.findOne({
      where: { id: expenseId },
    });

    if (!checkExpenseInDB)
      return next(new AppError("Invalid Id, Expense doest not exist", 400));

    let expensesAttachment = files?.map((file) => {
      return {
        attachmentURL: file.location,
        attachmentName: file.originalname,
        expenseId,
      };
    });

    let expensesAttachments = await Models.ExpenseAttachment.bulkCreate(
      expensesAttachment
    );

    return res.status(200).json({
      status: "success",
      message: "Expense Attachments Added Successfully.",
      data: {
        expensesAttachments,
      },
    });
  } else {
    const checkDepartmentInDB = await Models.Department.findOne({
      where: { id: req.body.purchasedBy, deleted: false },
    });

    if (!checkDepartmentInDB)
      return next(new AppError("Invalid Id, Department doest not exist", 400));

    let expense = await Models.Expense.create({ ...req.body });

    let expensesAttachments = files?.map((file) => {
      return {
        attachmentURL: file.location,
        attachmentName: file.originalname,
        expenseId: expense.id,
      };
    });

    await Models.ExpenseAttachment.bulkCreate(expensesAttachments);

    return res.status(200).json({
      status: "success",
      message: "Expense Added Successfully.",
      data: {
        expense,
      },
    });
  }
});

module.exports.deleteExpense = CatchAsync(async (req, res, next) => {
  const { id } = req.params;

  await Models.Expense.destroy({ where: { id } });

  await Models.ExpenseAttachment.destroy({ where: { expenseId: id } });

  await Models.ExpenseAttachment.destroy({ where: { id } });

  return res.status(200).json({
    status: "success",
    message: "Expense and attachments are deleted successfully",
    id,
  });
});

module.exports.getExpenses = CatchAsync(async (req, res, next) => {
  const { query } = req;

  let name = undefined;

  if (query?.itemName)
    name = where(
      fn("LOWER", col("itemName")),
      "LIKE",
      `%${urlencode.decode(query.itemName)?.toLowerCase()}%`
    );

  let whereCaluse = {
    itemName: name,
    purchasedBy: query.purchasedBy ? query.purchasedBy : undefined,
    paidBy: query.paidBy ? query.paidBy : undefined,
  };

  Object.keys(whereCaluse).forEach(
    (key) => whereCaluse[key] === undefined && delete whereCaluse[key]
  );

  const pagination = await Paginate(
    Models.Expense,
    whereCaluse,
    query.page,
    query.limit
  );

  let expenses = await Models.Expense.findAll({
    where: whereCaluse,
    order: [["createdAt", "desc"]],
    include: [
      {
        model: Models.Department,
        attributes: ["title", "id"],
      },
      { model: Models.ExpenseAttachment },
    ],
    limit: pagination.limit,
    offset: pagination.offset,
  });

  return res.status(200).json({
    status: "success",
    message: "All Expenses fecthed successfully",
    data: {
      expenses,
      pagination,
    },
  });
});

module.exports.changeExpenseStatus = CatchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { data } = req.body;
  let checkExpenseInDB = await Models.Expense.findOne({
    where: { id },
  });

  if (!checkExpenseInDB)
    return next(new AppError("Invalid ID. Expense not found", 404));

  [, [expense]] = await Models.Expense.update(
    {
      ...data,
    },
    { where: { id }, returning: true }
  );

  return res.status(200).json({
    status: "success",
    message: "Expense status changed successfully",
    data: {
      expense,
    },
  });
});

module.exports.updateExpense = CatchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { data } = req.body;
  let checkExpenseInDB = await Models.Expense.findOne({
    where: { id },
  });

  if (!checkExpenseInDB)
    return next(new AppError("Invalid ID. Expense not found", 404));

  if (!data)
    return res.status(404).json({
      status: "fail",
      message: "No data is given inside body to update the Expense",
    });

  [, [expense]] = await Models.Expense.update(
    {
      ...data,
    },
    { where: { id }, returning: true }
  );

  return res.status(200).json({
    status: "success",
    message: "Expense updated successfully",
    data: {
      expense,
    },
  });
});
