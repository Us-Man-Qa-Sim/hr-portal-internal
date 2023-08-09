const Models = require("../models");
const AppError = require("../utils/AppError");
const CatchAsync = require("../utils/CatchAsync");
const Helpers = require("../utils/Helpers");
const Services = require("../Services/Salary.service");
const { createPDF } = require("../Pdf/paySlip");
const { roleIds } = require("../configs/Constants");
let { Op, where, fn, col } = require("sequelize");
const urlencode = require("urlencode");

var fs = require("fs");

module.exports.addEmployeeSalary = CatchAsync(async (req, res, next) => {
  const { data } = req.body;

  const checkUserInDB = await Models.User.findOne({
    where: { id: data.userId, roleId: roleIds[1] },
  });

  if (!checkUserInDB)
    return next(new AppError("Invalid Id, User not found", 404));

  const checkUserSalaryInDB = await Models.EmployeeSalary.findOne({
    where: { userId: data.userId },
  });

  if (checkUserSalaryInDB)
    return next(new AppError("Invalid, User salary already available", 404));

  let incentivesInDB = [];

  if (data.incentives && data.incentives.length >= 1) {
    incentivesInDB = await Models.Incentive.findAll({
      where: { id: { [Op.in]: data.incentives } },
    });

    if (incentivesInDB.length !== data.incentives.length)
      return next(new AppError("Invalid Ids, Incentives not found", 404));

    employeeIncentives = [];

    data.incentives.map((item) => {
      employeeIncentives.push({
        userId: data.userId,
        incentiveId: item,
      });
    });

    await Models.EmployeeIncentive.bulkCreate(employeeIncentives);
  }

  let netSalary = Services.calculateEmployeeNetSalary(
    data.baseSalary,
    incentivesInDB
  );

  let salary = await Models.EmployeeSalary.create({
    userId: data.userId,
    baseSalary: data.baseSalary,
    netSalary: netSalary.salary,
  });

  return res.status(201).json({
    status: "success",
    message: "Salary of employee added successfully",
    data: {
      salary,
    },
  });
});

module.exports.getEmployeeSalary = CatchAsync(async (req, res, next) => {
  const { user, query } = req;
  let name = {};
  let whereCaluse = undefined;

  let modelName;

  if (user.roleId === roleIds[0]) {
    if (query?.name)
      name = where(
        fn("LOWER", col("name")),
        "LIKE",
        `%${urlencode.decode(query.name)?.toLowerCase()}%`
      );
    whereCaluse = { userId: { [Op.not]: user?.id } };
    modelName = Models.EmployeeSalary;
  } else {
    whereCaluse = {
      userId: user.id,
      month: query.month ? query.month : undefined,
      year: query.month
        ? query.year
          ? query.year
          : new Date().getFullYear()
        : undefined,
    };

    Object.keys(whereCaluse).forEach((item) => {
      if (whereCaluse[item] === undefined) delete whereCaluse[item];
    });
    modelName = Models.EmployeeSalarySlip;
  }

  let salaries = await modelName.findAll({
    where: whereCaluse,
    include: [
      {
        model: Models.User,
        where: name,
        attributes: ["id", "name", "email", "joiningDate", "profilePhoto"],
        include: [
          { model: Models.Role, attributes: ["id", "title"] },
          { model: Models.Designation, attributes: ["id", "title"] },
        ],
      },
    ],
    order: [["createdAt", "desc"]],
  });

  salaries = Helpers.convertToPlainJSObject(salaries);

  return res.status(200).json({
    status: "success",
    message: "Salaries Fetched successfully",
    salaries,
  });
});

module.exports.deleteItem = CatchAsync(async (req, res, next) => {
  const { id } = req.params;

  let checkUserSalaryInDB = await Models.EmployeeSalary.findOne({
    where: { id },
  });

  if (!checkUserSalaryInDB)
    return next(new AppError("Invalid Id, Salary does not exist"));

  const { userId } = checkUserSalaryInDB;

  await Models.EmployeeSalary.destroy({ where: { id } });

  await Models.EmployeeIncentive.destroy({
    where: { userId },
  });

  return res.status(200).json({
    status: "success",
    message: `Salary and his Incentives are deleted successfully`,
    id,
  });
});

module.exports.updateEmployeeSalary = CatchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { data } = req.body;

  const checkUserSalaryInDB = await Models.EmployeeSalary.findOne({
    where: { id },
  });

  if (!checkUserSalaryInDB)
    return next(new AppError("Invalid Id, User salary does not exist", 404));

  const { userId, baseSalary } = checkUserSalaryInDB;

  let incentivesInDB = [];

  if (data.incentives && data.incentives.length >= 1) {
    incentivesInDB = await Models.Incentive.findAll({
      where: { id: { [Op.in]: data.incentives } },
    });

    if (incentivesInDB.length !== data.incentives.length)
      return next(new AppError("Invalid Ids, Incentives not found", 404));

    await Models.EmployeeIncentive.destroy({ where: { userId } });

    employeeIncentives = [];

    data.incentives.map((item) => {
      employeeIncentives.push({
        userId,
        incentiveId: item,
      });
    });

    await Models.EmployeeIncentive.bulkCreate(employeeIncentives);
  }

  let netSalary = Services.calculateEmployeeNetSalary(
    data.baseSalary ? data.baseSalary : baseSalary,
    incentivesInDB
  );

  let [, [salary]] = await Models.EmployeeSalary.update(
    {
      baseSalary: data.baseSalary,
      netSalary: netSalary.salary,
    },
    { where: { id }, returning: true }
  );

  return res.status(201).json({
    status: "success",
    message: "Salary of employee updated successfully",
    data: {
      salary,
    },
  });
});

module.exports.employeeSalaryInfo = CatchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { user: loggedUser } = req;
  let result;

  if (loggedUser.designationId && !loggedUser.isClient) {
    result = await Services.calculateOwnSalaryInfo(next, id, loggedUser);
  } else {
    result = await Services.calculateEmployeeSalaryInfo(next, id);
  }

  if (result) {
    return res.status(200).json({
      status: "success",
      message: "Salary detail Fetched successfully",
      data: {
        ...result,
      },
    });
  }
});

module.exports.employeeSalaryPdf = CatchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { user: loggedUser } = req;
  let result;

  if (loggedUser.designationId && !loggedUser.isClient) {
    result = await Services.calculateOwnSalaryInfo(next, id, loggedUser);
  } else {
    result = await Services.calculateEmployeeSalaryInfo(next, id);
  }

  if (result) {
    let fileName = "paySlip";

    let earnIncentive = [
      { incentive: "Base Salary", calculatedAmount: result.salary.baseSalary },
    ];

    earnIncentive = earnIncentive.concat(result.earningIncentives);
    console.log(result.deductionIncentives);

    let deductionIncentive = [];

    if (parseInt(result.lopDeduction) > 0)
      deductionIncentive = [
        { incentive: "LOP", calculatedAmount: result.lopDeduction },
      ];

    deductionIncentive = deductionIncentive.concat(result.deductionIncentives);

    await createPDF(
      result.user,
      result.salary,
      deductionIncentive,
      earnIncentive,
      result.totalEarn,
      result.totalDeduction,
      result.lopDeduction ? result.lopDeduction : 0,
      fileName
    );

    var stat = fs.statSync(`${fileName}.pdf`);
    res.setHeader("Content-Length", stat.size);
    res.setHeader(
      "Content-disposition",
      `attachment; filename=${fileName}.pdf`
    );
    var data = fs.readFileSync(`${fileName}.pdf`);
    await Helpers.deleteFile(`${fileName}.pdf`);
    res.contentType("application/pdf");
    res.send(data);
  }
});
