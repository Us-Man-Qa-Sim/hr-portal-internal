const Models = require("../models");
const { IncentiveType } = require("../configs/Constants");
const AppError = require("../utils/AppError");
const { Op, fn, where, col } = require("sequelize");
const Helpers = require("../utils/Helpers");

const calculateEmployeeNetSalary = (baseSalary, incentives) => {
  let amount = 0;
  let salary = baseSalary;

  if (incentives.length === 0) return { salary, incentives };

  incentives.map((item) => {
    let { type, date, amount, percentage, isMonthly, isPercentage } = item;

    if (isMonthly) {
      const d = new Date();
      date = new Date(date);
      let incentiveDate = date.getMonth() + 1;
      let cureentDate = d.getMonth() + 1;
      if (incentiveDate !== cureentDate) return;
    }

    if (isPercentage) {
      let percentageNumber = isPercentage ? parseFloat(percentage) : 0;
      amount = Math.round((percentageNumber / 100) * baseSalary);
    }

    salary =
      type === IncentiveType.DEC
        ? parseInt(salary) - parseInt(amount)
        : parseInt(salary) + parseInt(amount);

    item["calculatedAmount"] = amount;
  });
  return { salary, incentives };
};

const addSalaryHistory = async () => {
  let userId = "f3f3c009-23cb-44c1-9adc-30767dbc8b50";
  let salary = await Models.EmployeeSalary.findOne({ where: { userId } });
  let addSalaryRecord = [];

  const { netSalary, baseSalary } = salary;

  addSalaryRecord.push();

  let employeeSlip = await Models.EmployeeSalarySlip.create({
    netSalary,
    baseSalary,
    userId,
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  });

  let userIncenitves = await Models.EmployeeIncentive.findAll({
    where: { userId },
    include: [{ model: Models.Incentive }],
  });

  userIncenitves = JSON.parse(JSON.stringify(userIncenitves));

  userIncenitves.map((item) => {
    const {
      amount,
      incentive,
      type,
      isMonthly,
      date,
      isPercentage,
      percentage,
    } = item.incentive;
    addSalaryRecord.push({
      amount,
      incentive,
      type,
      isMonthly,
      date,
      isPercentage,
      percentage,
      MonthlySalaryId: employeeSlip.id,
    });
  });

  if (addSalaryRecord.length === 0) return;
  await Models.MonthlySalaryIncentive.bulkCreate(addSalaryRecord);
};

const calculateEmployeeSalaryInfo = async (next, id) => {
  let checkUserSalaryInDB = await Models.EmployeeSalary.findOne({
    where: { id },
  });

  if (!checkUserSalaryInDB)
    return next(new AppError("Invalid Id, Salary does not exist", 404));

  let salaries = await Models.EmployeeSalary.findOne({
    where: { id },
    include: [
      {
        model: Models.User,
        attributes: ["id", "name", "email", "joiningDate", "profilePhoto"],
        include: [
          { model: Models.Designation, attributes: ["id", "title"] },
          {
            model: Models.EmployeeIncentive,
            include: [{ model: Models.Incentive }],
          },
        ],
      },
    ],
    order: [["createdAt", "desc"]],
  });

  salaries = Helpers.convertToPlainJSObject(salaries);

  let earningIncentives = [];
  let deductionIncentives = [];

  const { user } = salaries;
  const { employeeIncentives } = user;

  employeeIncentives.map((item) => {
    const { incentive } = item;
    if (incentive.type === IncentiveType.INC) earningIncentives.push(incentive);
    else deductionIncentives.push(incentive);
  });

  delete user?.employeeIncentives;
  delete salaries?.user;

  let totalEarn = calculateEmployeeNetSalary(
    salaries.baseSalary,
    earningIncentives
  );

  earningIncentives = totalEarn.incentives;
  totalEarn = totalEarn.salary;

  let totalDeduction = calculateEmployeeNetSalary(
    salaries.baseSalary,
    deductionIncentives
  );

  deductionIncentives = totalDeduction.incentives;
  totalDeduction = totalDeduction.salary;

  totalEarn = parseInt(totalEarn) - parseInt(salaries.baseSalary);
  totalDeduction = parseInt(salaries.baseSalary) - parseInt(totalDeduction);

  return {
    salary: salaries,
    user,
    earningIncentives,
    deductionIncentives,
    totalEarn,
    totalDeduction,
  };
};

const calculateOwnSalaryInfo = async (next, id, loggedUser) => {
  let checkUserSalaryInDB = await Models.EmployeeSalarySlip.findOne({
    where: { id },
  });

  if (!checkUserSalaryInDB)
    return next(new AppError("Invalid ID. salary not found", 404));

  let salaries = await Models.EmployeeSalarySlip.findOne({
    where: { id },
    include: [
      {
        model: Models.User,
        attributes: ["id", "name", "email", "joiningDate", "profilePhoto"],
        include: [{ model: Models.Designation, attributes: ["id", "title"] }],
      },
      { model: Models.MonthlySalaryIncentive },
    ],
    order: [["createdAt", "desc"]],
  });

  if (loggedUser.id !== salaries.userId) {
    return next(
      new AppError(
        "Invalid ID. you can not view the salary detail of other user",
        404
      )
    );
  }

  salaries = Helpers.convertToPlainJSObject(salaries);

  let earningIncentives = [];
  let deductionIncentives = [];

  const { user } = salaries;
  const { monthlySalaryIncentives } = salaries;

  monthlySalaryIncentives.map((item) => {
    if (item.type === IncentiveType.INC) earningIncentives.push(item);
    else deductionIncentives.push(item);
  });

  delete salaries?.monthlySalaryIncentives;
  delete salaries?.user;

  let totalEarn = calculateEmployeeNetSalary(
    salaries.baseSalary,
    earningIncentives
  );

  earningIncentives = totalEarn.incentives;
  totalEarn = totalEarn.salary;

  let totalDeduction = calculateEmployeeNetSalary(
    salaries.baseSalary,
    deductionIncentives
  );

  deductionIncentives = totalDeduction.incentives;
  totalDeduction = totalDeduction.salary;

  totalEarn = parseInt(totalEarn) - parseInt(salaries.baseSalary);
  totalDeduction = parseInt(salaries.baseSalary) - parseInt(totalDeduction);

  return {
    salary: salaries,
    user,
    earningIncentives,
    deductionIncentives,
    totalEarn,
    totalDeduction,
  };
};

module.exports = {
  calculateEmployeeNetSalary,
  addSalaryHistory,
  calculateEmployeeSalaryInfo,
  calculateOwnSalaryInfo,
};
