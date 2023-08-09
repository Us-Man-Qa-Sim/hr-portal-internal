const Models = require("../models");
const AppError = require("../utils/AppError");
const CatchAsync = require("../utils/CatchAsync");
const Helpers = require("../utils/Helpers");
const Services = require("../Services/Attendance.service");
let moment = require("moment");
const { roleIds } = require("../configs/Constants");
let { Op, where, fn, col } = require("sequelize");

module.exports.addAttendance = CatchAsync(async (req, res, next) => {
  const { user } = req;

  let date = moment(new Date()).format("YYYY-MM-DD");
  let hours = new Date().getHours();

  let count = await Models.Attendance.count({
    where: {
      userId: user.id,
      [Op.and]: [where(fn("date", col("day")), "=", date)],
    },
  });

  console.log("count-------------", count);
  if (count % 2 === 0 && hours >= 18)
    return next(new AppError("Invalid, You can not punch In after 6 PM", 404));

  let attendance = await Models.Attendance.create({ userId: user.id });
  attendance = Helpers.convertToPlainJSObject(attendance);

  return res.status(200).json({
    status: "success",
    message: "Attendance added successfully",
    data: {
      attendance,
    },
  });
});

module.exports.rfidAttendance = CatchAsync(async (req, res, next) => {
  const userId = req.body;

  const checkUserInDB = await Models.User.findOne({
    where: { id: userId, roleId: roleIds[1] },
  });

  if (!checkUserInDB)
    return next(new AppError("Invalid Id, User not found", 404));

  let date = moment(new Date()).format("YYYY-MM-DD");
  let hours = new Date().getHours();

  let count = await Models.Attendance.count({
    where: {
      userId,
      [Op.and]: [where(fn("date", col("day")), "=", date)],
    },
  });

  if (count % 2 === 0 && hours >= 18)
    return next(new AppError("Invalid, You can not punch In after 6 PM", 404));

  let attendance = await Models.Attendance.create({ userId: userId });

  attendance = Helpers.convertToPlainJSObject(attendance);

  return res.status(200).json({
    status: "success",
    message: "Attendance added successfully",
    data: {
      attendance,
    },
  });
});

module.exports.rfidAttendanceTime = CatchAsync(async (req, res, next) => {
  let date1 = new Date();
  let date = moment(date1).format("DD/MM/YYYY");
  let time = moment(date1).format("HH:mm");
  return res.status(200).json({
    date,
    time,
  });
});

module.exports.getAttendance = CatchAsync(async (req, res, next) => {
  const { user, query } = req;

  let whereCaluse = undefined;

  if (user.roleId === roleIds[0]) {
    whereCaluse = { userId: { [Op.not]: user?.id } };
  } else {
    whereCaluse = await Services.makeAttendanceWhereCaluse(user, query);
  }

  let attendance = await Models.Attendance.findAll({
    where: whereCaluse,
    include: [{ model: Models.User, attributes: ["id", "name", "email"] }],
    attributes: ["id", "day"],
    order: [["createdAt", "desc"]],
  });

  attendance = attendance.map((item) => {
    return Helpers.convertToPlainJSObject(item);
  });

  attendance = attendance.reverse();

  let date = undefined;

  if (query?.date) {
    attendance = attendance.filter((data) => {
      date = moment(data.day).format("YYYY-MM-DD");
      if (moment(date).isSame(query?.date)) return data;
    });
  }

  let data;
  if (user.roleId === roleIds[0]) {
    let allEmployeeAttendance = await Services.getAttendanceChart(query);

    data = {
      allEmployeeAttendance,
    };
  } else {
    let attendanceSummary = Services.calculateAttendanceData(attendance);
    data = {
      attendanceSummary: attendanceSummary.reverse(),
    };
  }

  return res.status(200).json({
    status: "success",
    message: "Attendance Fetched successfully",
    data,
  });
});

module.exports.getTodayDate = CatchAsync(async (req, res, next) => {
  const { user } = req;

  let whereCaluse = {};

  if (user.roleId === roleIds[0]) {
    return res.status(200).json({
      data: [],
    });
  } else {
    whereCaluse["userId"] = user.id;
  }

  let attendance = await Models.Attendance.findAll({
    where: whereCaluse,
    include: [{ model: Models.User, attributes: ["id", "name", "email"] }],
    attributes: ["id", "day"],
    order: [["createdAt", "desc"]],
  });

  attendance = attendance.map((item) => {
    return Helpers.convertToPlainJSObject(item);
  });

  attendance = attendance.reverse();

  let date = undefined;

  let todayDate = moment(new Date()).format("YYYY-MM-DD");

  let TodayAttendance = attendance.filter((data) => {
    date = moment(data.day).format("YYYY-MM-DD");
    if (moment(date).isSame(todayDate)) return data.day;
  });

  let data;

  let todayTime = Services.todayCalculations(TodayAttendance);
  let attendanceSummary = Services.calculateAttendanceData(attendance);
  let employeeStatistics = Services.employeeStatistics(attendanceSummary);
  data = {
    TodayAttendance,
    attendanceSummary,
    todayTime,
    employeeStatistics,
  };

  return res.status(200).json({
    status: "success",
    message: "Attendance Fetched successfully",
    data,
  });
});
