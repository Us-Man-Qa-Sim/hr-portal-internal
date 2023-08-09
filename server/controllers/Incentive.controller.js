const Models = require("../models");
const AppError = require("../utils/AppError");
const CatchAsync = require("../utils/CatchAsync");
const Helpers = require("../utils/Helpers");
const Paginate = require("../utils/Paginate");
const { IncentiveType } = require("../configs/Constants");

module.exports.createIncentive = CatchAsync(async (req, res, next) => {
  const {
    amount,
    incentive,
    isMonthly,
    type,
    month,
    year,
    isPercentage,
    percentage,
  } = req.body.data;

  let checkyear = year ? year : new Date().getFullYear();
  let date = new Date(checkyear, parseInt(month) - 1, 2);

  let newIncentive = await Models.Incentive.create({
    amount: amount ? amount : null,
    incentive,
    type: type === "DEC" ? IncentiveType.DEC : IncentiveType.INC,
    isMonthly: isMonthly ? true : false,
    date: isMonthly ? date : null,
    isPercentage: isPercentage ? true : false,
    percentage: isPercentage ? percentage : null,
  });

  newIncentive = Helpers.convertToPlainJSObject(newIncentive);
  newIncentive = Helpers.removeDelete(newIncentive);
  return res.status(200).json({
    status: "success",
    message: "Incentive created successfully",
    data: { newIncentive },
  });
});

module.exports.getIncentives = CatchAsync(async (req, res, next) => {
  const { query } = req;
  let whereCaluse = {
    type: query.type ? IncentiveType[query.type] : undefined,
  };
  Object.keys(whereCaluse).forEach(
    (key) => whereCaluse[key] === undefined && delete whereCaluse[key]
  );

  let incentives = await Models.Incentive.findAll({
    where: whereCaluse,
    order: [["createdAt", "desc"]],
  });

  return res.status(200).json({
    status: "success",
    message: "Incentives fetched successfully",
    data: { incentives },
  });
});

module.exports.deleteIncentive = CatchAsync(async (req, res, next) => {
  const { id } = req.params;

  const checkIncentiveInDB = await Models.Incentive.findOne({
    where: { id: id },
  });

  if (!checkIncentiveInDB)
    return next(new AppError("Invalid ID. Incentive not found", 404));

  await Models.Incentive.destroy({ where: { id: id } });

  res.status(200).json({
    status: "success",
    message: "Incentive is deleted",
    id,
  });
});

module.exports.updateIncentive = CatchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { year, month, isMonthly, type } = req.body.data;
  req.body.data["type"] = IncentiveType[type];
  let checkIncentiveInDB = await Models.Incentive.findOne({ where: { id } });

  if (!checkIncentiveInDB)
    return next(new AppError("Invalid ID. Incentive not found", 404));
  if (req.body.data) {
    if (isMonthly && isMonthly === true) {
      let checkyear = year ? year : new Date().getFullYear();
      let date = new Date(checkyear, parseInt(month) - 1, 2);
      req.body.data["date"] = date;
    }

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
    status: "success",
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
