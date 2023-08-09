var cron = require("node-cron");
const Models = require("../models");
const { IncentiveType } = require("../configs/Constants");
module.exports.payOut = cron.schedule("0 0 0 1 * *", async () => {
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
        return { employeeName: name, accountNumber, amount: baseSalary };
      }
      return { employeeName: name, accountNumber, amount: baseSalary };
    }
    baseSalary =
      type === IncentiveType.DEC
        ? parseInt(baseSalary) - parseInt(amount)
        : parseInt(baseSalary) + parseInt(amount);
    return { employeeName: name, accountNumber, amount: baseSalary };
  });

  await Models.PayOut.bulkCreate(payOuts);

  console.log(payOuts);
});
