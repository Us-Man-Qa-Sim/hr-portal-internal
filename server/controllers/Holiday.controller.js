const Models = require("../models");
const AppError = require("../utils/AppError");
const CatchAsync = require("../utils/CatchAsync");
const Helpers = require("../utils/Helpers");
const Paginate = require("../utils/Paginate");
const { Op, fn, where, col } = require("sequelize");

module.exports.addHoliday = CatchAsync(async (req, res, next) => {
  const { holidayName, date, days } = req.body.data;

  let holiday = await Models.Holiday.create({
    holidayName,
    date,
    days,
  });

  holiday = Helpers.convertToPlainJSObject(holiday);

  return res.status(200).json({
    status: "success",
    message: "Holiday added successfully",
    data: {
      holiday,
    },
  });
});

module.exports.deleteHoliday = CatchAsync(async (req, res, next) => {
  const { id } = req.params;

  const checkHolidayInDB = await Models.Holiday.findOne({
    where: { id },
  });
  if (!checkHolidayInDB)
    return next(new AppError("Invalid ID. Holiday not found", 404));

  await Models.Holiday.destroy({
    where: {
      id,
    },
  });

  return res.status(200).json({
    status: "success",
    message: "Holiday deleted successfully",
    data: {
      departmentId: id,
    },
  });
});

module.exports.getHolidays = CatchAsync(async (req, res, next) => {
  const { query } = req;

  let whereClause = query.search
    ? {
        [Op.or]: [
          //   { holidayName: { [Op.like]: `%${query.search}%` } },
          //   { days: { [Op.like]: `%${query.search}%` } },
          where(fn("lower", col("holidayName")), {
            [Op.like]: `%${query.search.toLowerCase()}%`,
          }),
          { days: { [Op.like]: `%${query.search}%` } },
        ],
      }
    : {};

  console.log(whereClause);

  const pagination = await Paginate(
    Models.Holiday,
    whereClause,
    query.page,
    query.limit
  );

  //   console.log(whereClause);
  //   return;

  let holidays = await Models.Holiday.findAll({
    where: whereClause,
    order: [["createdAt", "desc"]],
    limit: pagination.limit,
    offset: pagination.offset,
  });

  holidays = holidays.map((holiday) => {
    return Helpers.convertToPlainJSObject(holiday);
  });

  return res.status(200).json({
    status: "success",
    message: "All Holidays fecthed successfully",
    data: {
      holidays,
      pagination,
    },
  });
});

module.exports.updateHoliday = CatchAsync(async (req, res, next) => {
  const { id } = req.params;

  const checkHolidayInDB = await Models.Holiday.findOne({
    where: { id },
  });

  if (!checkHolidayInDB)
    return next(new AppError("Invalid ID. Department not found", 404));

  if (req.body.data) {
    let [, [holiday]] = await Models.Holiday.update(
      { ...req.body.data },
      {
        where: { id },
        returning: true,
      }
    );

    holiday = Helpers.convertToPlainJSObject(holiday);

    return res.status(200).json({
      status: "success",
      message: "Holiday updated successfully",
      data: {
        holiday,
      },
    });
  }
  return res.status(404).json({
    status: "fail",
    message: "No data is given to update the holiday",
  });
});
