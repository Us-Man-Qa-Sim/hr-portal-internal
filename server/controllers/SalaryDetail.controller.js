const { IncentiveType } = require("../configs/Constants");
const Models = require("../models");
const AppError = require("../utils/AppError");
const CatchAsync = require("../utils/CatchAsync");
const Helpers = require("../utils/Helpers");
const Paginate = require("../utils/Paginate");

module.exports.createSalaryDetail = CatchAsync(async (req, res, next) => {
  const { salaryId, incentiveId } = req.body.data;

  const checkSalary = await Models.Salary.findOne({ where: { id: salaryId } });
  if (!checkSalary)
    return next(new AppError("Invalid ID, No salary found", 404));

  const account = await Models.Account.findOne({
    where: { userId: checkSalary.userId },
  });
  const checkIncentive = await Models.Incentive.findOne({
    where: { id: incentiveId },
  });
  if (!checkIncentive)
    return next(new AppError("Invalid ID, No Incentive found", 404));

  const checkUserDetailInDB = await Models.SalaryDetail.findOne({
    where: { salaryId },
  });
  if (checkUserDetailInDB)
    return next(
      new AppError(
        "Only one incentive is allowed, Incentive is granted to that user earlier",
        404
      )
    );

  let salaryDetail = await Models.SalaryDetail.create({
    salaryId,
    incentiveId,
    accountId: account.id,
  });

  salaryDetail = Helpers.convertToPlainJSObject(salaryDetail);

  return res.status(200).json({
    status: "success",
    message: "Salary Detail created successfully",
    data: {
      salaryDetail,
    },
  });
});

module.exports.getSalaryDetails = CatchAsync(async (req, res, next) => {
  const { query } = req;

  const pagination = await Paginate(
    Models.Incentive,
    {},
    query.page,
    query.limit
  );

  let salaryDetails = await Models.SalaryDetail.findAll({
    attributes: {
      exclude: ["incentiveId", "salaryId", "updatedAt", "createdAt"],
    },
    order: [["createdAt", "desc"]],
    include: [
      {
        model: Models.Salary,
        as: "salary",
        attributes: ["baseSalary"],
        include: {
          model: Models.User,
          as: "user",
          required: true,
          attributes: ["name", "email"],
        },
      },
      {
        model: Models.Incentive,
        as: "incentive",
        attributes: ["incentive", "amount", "type", "date", "isMonthly"],
      },
      {
        model: Models.Account,
        as: "account",
        attributes: ["number"],
      },
    ],
    limit: pagination.limit,
    offset: pagination.offset,
  });

  const payOuts = salaryDetails?.map((salaryDetail) => {
    const { name } = salaryDetail.salary.user;
    const { number: accountNumber } = salaryDetail.account;
    let { baseSalary } = salaryDetail.salary;
    const { type, date, amount } = salaryDetail.incentive;
    const d = new Date();

    if (salaryDetail.incentive.isMonthly) {
      let incentiveDate = date.getMonth() + 1;
      let cureentDate = d.getMonth() + 1;
      if (incentiveDate === cureentDate) {
        baseSalary =
          type === IncentiveType.DEC
            ? parseInt(baseSalary) - parseInt(amount)
            : parseInt(baseSalary) + parseInt(amount);
        return { name, accountNumber, totalAmount: baseSalary };
      }
      return { name, accountNumber, totalAmount: baseSalary };
    }
    baseSalary =
      type === IncentiveType.DEC
        ? parseInt(baseSalary) - parseInt(amount)
        : parseInt(baseSalary) + parseInt(amount);
    return { name, accountNumber, totalAmount: baseSalary };
  });

  return res.status(200).json({
    status: "success",
    message: "Incentives fetched successfully",
    data: { payOuts, pagination, salaryDetails },
  });
});

module.exports.deleteSalaryDetail = CatchAsync(async (req, res, next) => {
  const { id } = req.params;

  const checkSalaryDetailInDB = await Models.SalaryDetail.findOne({
    where: { id: id },
  });

  if (!checkSalaryDetailInDB)
    return next(new AppError("Invalid ID. SalaryDetail not found", 404));

  let salaryDetail = await Models.SalaryDetail.destroy({ where: { id: id } });
  res.status(200).json({
    status: "success",
    message: "Incentive is delated",
    data: { salaryDetailid: id },
  });
});

module.exports.updateIncentive = CatchAsync(async (req, res, next) => {
  const { id } = req.params;

  let checkIncentiveInDB = await Models.Incentive.findOne({ where: { id } });

  if (!checkIncentiveInDB)
    return next(new AppError("Invalid ID. Incentive not found", 404));
  if (req.body.data) {
    let [, [incentive]] = await Models.Incentive.update(
      { ...req.body.data },
      { where: { id }, returning: true }
    );

    incentive = Helpers.convertToPlainJSObject(incentive);
    return res.status(200).json({
      status: "success",
      message: "Incentive updated successfully",
      data: {
        incentive,
      },
    });
  }
  return res.status(200).json({
    status: "fail",
    message: "No data is given to update the salary",
  });
});

module.exports.getIncentive = CatchAsync(async (req, res, next) => {
  const { id } = req.params;

  let incentive = await Models.Incentive.findOne({
    where: { id: id },
  });

  if (!incentive) return next(new AppError("Incentive not found", 404));
  incentive = Helpers.convertToPlainJSObject(incentive);

  return res.status(200).json({
    status: "success",
    message: "Incentive fecthed successfully",
    data: {
      incentive,
    },
  });
});
