const Models = require("../models");
const AppError = require("../utils/AppError");
const CatchAsync = require("../utils/CatchAsync");
const Helpers = require("../utils/Helpers");
let { Op, where, fn, col, literal } = require("sequelize");
const moment = require("moment");
const services = require('../Services/Report.service')
const { calculateAttendanceData } = require('../Services/Attendance.service')

module.exports.getAttendanceSummary = CatchAsync(async (req, res, next) => {

    const { query } = req

    let whereClause = services.makeWhereClause(query, next)

    let attendance = await Models.Attendance.findAll({
        where: whereClause,
        order: [["day", "ASC"]],
    })

    attendance = Helpers.convertToPlainJSObject(attendance)

    console.time("answer time");
    let userData = await services.getUserAttendances(query, attendance)
    console.timeEnd("answer time");

    const { leaveRecord, holidaysDates } = await services.getLeaveAndHoliday(query)

    userData = services.timeCalculate(userData, leaveRecord, holidaysDates)
    userData = services.getAttendanceSummaryFilteredData(query, userData)

    return res.status(200).json({
        status: "success",
        message: "Attendance Summary fetched successfully",
        data: { userData },
    });
});

module.exports.getAttendanceAbnormal = CatchAsync(async (req, res, next) => {

    const { query } = req

    let whereClause = services.makeWhereClause(query, next)

    let attendance = await Models.Attendance.findAll({
        where: whereClause,
        order: [["day", "ASC"]],
    })

    attendance = Helpers.convertToPlainJSObject(attendance)

    console.time("answer time");
    let userData = await services.getUserAttendances(query, attendance)
    console.timeEnd("answer time");

    const { leaveRecord, holidaysDates } = await services.getLeaveAndHoliday(query)

    userData = services.timeCalculate(userData, leaveRecord, holidaysDates)
    userData = services.getAttendanceAbnormalData(userData)

    return res.status(200).json({
        status: "success",
        message: "Attendance Summary fetched successfully",
        data: { userData },
    });
});
