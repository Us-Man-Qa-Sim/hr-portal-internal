const cron = require("node-cron");
const Models = require("../models");
const CatchAsync = require("../utils/CatchAsync");
const {
  IncentiveType,
  roleIds,
  leaveStatusIds,
} = require("../configs/Constants");
let moment = require("moment");
const Services = require("../Services/Salary.service");
const { getLeavesDates } = require("../Services/Attendance.service");
const Helpers = require("../utils/Helpers");
const { Op } = require("sequelize");
const { createPDF } = require("../Pdf/paySlip");
const { email } = require("../email/sendPaySlip");
var fs = require("fs");

module.exports.PaySlipCrone = cron.schedule(
  "0 0 28 * *",
  CatchAsync(async () => {
    let leaves = await getLeavesForCronJob();
    let fileName = "paySlip";
    const users = await Models.User.findAll({
      where: { roleId: roleIds[1], deleted: false },
    });

    let paySlipList = [];

    for (const i in users) {
      let salarydata = await getSalary(users[i].id);

      if (!salarydata) continue;

      let userDeduction = 0;
      const {
        user,
        earningIncentives,
        deductionIncentives,
        salary,
        totalEarn,
        totalDeduction,
      } = salarydata;
      const { baseSalary } = salary;

      let lopDays = leaves.filter((item) => {
        if (item.userId === users[i].id) return item;
      });

      let lopDeduction = Math.floor((0.5 / 100) * baseSalary);
      userDeduction = Math.floor(
        parseFloat(lopDeduction) * parseInt(lopDays.length)
      );

      let earnIncentive = [
        { incentive: "Base Salary", calculatedAmount: baseSalary },
      ];

      earnIncentive = earnIncentive.concat(earningIncentives);

      let deductionIncentive = [];

      if (parseInt(userDeduction) > 0)
        deductionIncentive = [
          { incentive: "LOP", calculatedAmount: userDeduction },
        ];

      deductionIncentive = deductionIncentive.concat(deductionIncentives);

      paySlipList.push({
        user,
        salary,
        deductionIncentive,
        earnIncentive,
        totalEarn: parseInt(totalEarn) + parseInt(baseSalary),
        totalDeduction: parseInt(totalDeduction) + parseInt(userDeduction),
        lop: userDeduction,
        fileName,
      });

      //    Keeping backup of Salary and Incentives for logs

      let userIncentivesBackupList = await addSalaryBackup(
        salary,
        userDeduction,
        earningIncentives.concat(deductionIncentives)
      );

      await Models.MonthlySalaryIncentive.bulkCreate(userIncentivesBackupList);
    }

    // Email for paySlip code will be there

    for (const i in paySlipList) {
      console.log("-----");
      console.log("Going for PDF Boss");
      let paySlip = paySlipList[i];
      paySlip["fileName"] = `${fileName}${i}`;
      await createPDF(
        paySlip.user,
        paySlip.salary,
        paySlip.deductionIncentive,
        paySlip.earnIncentive,
        paySlip.totalEarn,
        paySlip.totalDeduction,
        paySlip.lop,
        paySlip.fileName
      );
      await sendEmail(paySlip.user, paySlip.fileName);
      await deleteFile(`./${fileName}${i}.pdf`);
    }
    console.log("------");
  })
);

const getLeavesForCronJob = async () => {
  let year = new Date().getFullYear();
  let month = new Date().getMonth(); //month 0-11 +1 => 1-12

  const startDate = new Date(`${year}-${month}-28`);
  const endDate = new Date(`${year}-${month + 1}-28`);

  let leaves = await Models.LeaveApplication.findAll({
    where: {
      leavestatus: leaveStatusIds.Approved,
      leaveType: "LOP",
      [Op.or]: [
        {
          from: {
            [Op.and]: {
              [Op.gte]: startDate,
              [Op.lte]: endDate,
            },
          },
        },
        {
          to: {
            [Op.and]: {
              [Op.gte]: startDate,
              [Op.lte]: endDate,
            },
          },
        },
      ],
    },
  });

  leaves = Helpers.convertToPlainJSObject(leaves);
  leaves = leaves.map((leave) => {
    let from = moment(leave.from).format("YYYY-MM-DD");
    let to = moment(leave.to).format("YYYY-MM-DD");
    let newStartDate = moment(from).isSameOrAfter(
      moment(startDate).format("YYYY-MM-DD", "day")
    );
    let newEndDate = moment(to).isSameOrBefore(
      moment(endDate).format("YYYY-MM-DD", "day")
    );
    if (!newStartDate) leave["from"] = startDate;
    if (!newEndDate) leave["to"] = endDate;
    return leave;
  });

  leaves = getLeavesDates(leaves);
  return leaves;
};

const addSalaryBackup = async (salary, userDeduction, incentives) => {
  const { netSalary, baseSalary, userId } = salary;
  let employeeSlip = await Models.EmployeeSalarySlip.create({
    netSalary,
    baseSalary,
    userId,
    lopDeduction: userDeduction,
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  });

  let userIncentivesBackupList = [];

  incentives.forEach((item) => {
    const {
      amount,
      incentive,
      type,
      isMonthly,
      date,
      isPercentage,
      percentage,
    } = item;
    userIncentivesBackupList.push({
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

  return userIncentivesBackupList;
};

const getSalary = async (userId) => {
  let salaries = await Models.EmployeeSalary.findOne({
    where: { userId },
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
  if (!salaries) return;
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

  let totalEarn = Services.calculateEmployeeNetSalary(
    salaries.baseSalary,
    earningIncentives
  );

  earningIncentives = totalEarn.incentives;
  totalEarn = totalEarn.salary;

  let totalDeduction = Services.calculateEmployeeNetSalary(
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

const sendEmail = async (user, fileName) => {
  let date = new Date();
  let month = date.toLocaleString("en-us", { month: "long" });
  let data = fs.readFileSync(`./${fileName}.pdf`);
  console.log("Reading the file boss for email");
  email({
    to: user.email,
    subject: `PaySlip`,
    html: `Hi ${user.name},<br>
        Here by attaching payslip details of <b>${month}</b>.`,
    attachments: [{ filename: "paySlip.pdf", content: data }],
  });
};

const deleteFile = async (fileName) => {
  console.log("Going for Delete Boss");
  fs.unlinkSync(fileName);
};
