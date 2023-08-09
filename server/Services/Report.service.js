const Models = require("../models");
const { leaveStatusIds, roleIds } = require("../configs/Constants");
const { Op, fn, where, col } = require("sequelize");
const Helpers = require("../utils/Helpers");
const moment = require("moment");
const { getLeavesDates, getHolidaysDates, calculateTime } = require('./Attendance.service')

const makeWhereClause = (query) => {

    if (query.startDate && query.endDate)
        return {
            day: {
                [Op.gte]: new Date(`${query.startDate} 00:00:00`),
                [Op.lte]: new Date(`${query.endDate} 23:59:59`)
            }
        }

    return {
        [Op.and]: [
            where(fn("date_part", "year", col("day")), new Date().getUTCFullYear()),
            where(fn("date_part", "month", col("day")), new Date().getMonth() + 1),
        ],

    }
};

const getUserAttendances = async (query = {}, attendance) => {

    let allUsers = await Models.User.findAll({
        where: {
            deleted: false,
            roleId: roleIds[1],
        },
        include: [{
            model: Models.Designation,
            attributes: ["id", "title"],
        }],
        attributes: ["id", "name", "profilePhoto", 'createdAt', 'designationId'],
    });
    allUsers = Helpers.convertToPlainJSObject(allUsers)
    let date = new Date()
    let Start = query.startDate && query.endDate ? moment(query.startDate) :
        moment(new Date(`${date.getFullYear()}-${date.getMonth() + 1}-01 00:00:00`))
    let End = query.startDate && query.endDate ? moment(query.endDate) :
        moment(new Date(`${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate() - 1} 00:00:00`))
    let startDate = Start;
    let endDate = End.add(1, "days");
    let dummyStartDate = startDate

    let userData = []

    allUsers = allUsers.map((user) => {

        let userActivity = attendance.filter((item) => item.userId === user.id)

        while (dummyStartDate.format("YYYY-MM-DD") !== endDate.format("YYYY-MM-DD")) {


            let attendanceActivity = userActivity.filter((item) => moment(item.day).format('YYYY-MM-DD') === moment(dummyStartDate).format('YYYY-MM-DD'))

            userData.push({

                attendanceCount: attendanceActivity.length,
                date: moment(dummyStartDate).format('YYYY-MM-DD'),
                attendance: attendanceActivity
            })
            dummyStartDate = dummyStartDate.add(1, "days");
        }
        user.createdAt = moment(user.createdAt).format('YYYY-MM-DD')
        let designation = user.designation.title

        delete user.designation

        dummyStartDate = query.startDate && query.endDate ? moment(query.startDate) :
            moment(new Date(`${date.getFullYear()}-${date.getMonth() + 1}-01 00:00:00`))

        user['userAttendance'] = userData
        user['designation'] = designation
        userData = []

        return user
    })

    return allUsers


}

const timeCalculate = ((userData, leaveRecord, holidaysDates) => {

    userData = userData.map((user) => {

        user.userAttendance = user.userAttendance.map((item) => {
            pop = false;
            if (item.attendance.length % 2 !== 0) {
                var date = item.date;
                var time = "18:00";
                let date1 = moment(`${date} ${time}`, "YYYY-MM-DD HH:mm");
                item.attendance.push({
                    day: date1,
                });
                pop = true;
            }
            let returnTime = calculateTime(item.attendance);

            var weekDay = moment(item.date).format("dddd");

            let isWeekend =
                weekDay === "Saturday" || weekDay === "Sunday" ? true : false;

            let isHoliday = holidaysDates.find(
                (holiday) => holiday.holidayDate === item.date
            );

            let isOnLeave = leaveRecord.find(
                (leave) =>
                    leave.userId === user.id && leave.leaveDate === item.date
            );


            let overTimeHours =
                parseInt(returnTime.hours) > 8
                    ? `${parseInt(returnTime.hours) - 8}`
                    : "0";
            let overTimeMinutes =
                parseInt(returnTime.hours) >= 8 ? `${returnTime.minutes}` : "0";

            let overTime = (`0${overTimeHours}`).slice(-2) + ':' + (`0${overTimeMinutes}`).slice(-2)


            let record = {
                status: returnTime.result,
                productionHours: returnTime.hours,
                productionMinutes: returnTime.minutes,
                breakHours: returnTime.Bhours,
                breakMinutes: returnTime.Bminutes,
                overTimeHours,
                overTimeMinutes,
                overTime,
                date: item.date,
                isWeekend,
                isHoliday: isHoliday ? true : false,
                holiday: isHoliday ? isHoliday : {},
                isOnLeave: isOnLeave ? true : false,
                leave: isOnLeave ? isOnLeave : {},
                activity: item.list,
                pop
            };

            return { ...item, ...record }
        })

        return user

    })
    return userData
})

const getLeaveAndHoliday = async (query = {}) => {
    let date = new Date()
    let Start = query.startDate && query.endDate ? moment(query.startDate) :
        moment(new Date(`${date.getFullYear()}-${date.getMonth() + 1}-01 00:00:00`))
    let End = query.startDate && query.endDate ? moment(query.endDate) :
        moment(new Date(`${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} 00:00:00`))

    //Leaves 

    let todaysLeaveRecord = await Models.LeaveApplication.findAll({
        where: {
            leavestatus: leaveStatusIds.Approved,
            from: {
                [Op.lte]: End
            }
        },
    });

    todaysLeaveRecord = Helpers.convertToPlainJSObject(todaysLeaveRecord)


    let leaveRecord = []
    todaysLeaveRecord.forEach((leave) => {

        if (moment(leave.from).isBefore(Start) && moment(leave.to).isBefore(Start)) { }
        else {
            leave.from = moment(leave.from).isBefore(Start) ? Start : leave.from
            leave.to = moment(leave.to).isAfter(End) ? End : leave.to
            leaveRecord.push(leave)
        }
    })

    leaveRecord = getLeavesDates(leaveRecord)


    let holidays = await Models.Holiday.findAll({
        // where: {
        //     from: {
        //         [Op.gte]: Start
        //     },
        //     to: {
        //         [Op.lte]: End
        //     }
        // },
    });


    let holidaysDates = getHolidaysDates(holidays);


    return { leaveRecord, holidaysDates }
}

const getAttendanceSummaryFilteredData = (query = {}, userData) => {

    let date = new Date()
    let Start = query.startDate && query.endDate ? moment(query.startDate) :
        moment(new Date(`${date.getFullYear()}-${date.getMonth() + 1}-01 00:00:00`))
    let End = query.startDate && query.endDate ? moment(query.endDate) :
        moment(new Date(`${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate() - 1} 00:00:00`))

    console.log({
        startDate: moment(Start).format('YYYY-MM-DD'),
        endDate: moment(End).format('YYYY-MM-DD')
    })

    // let userData = [dummy, dummy1]


    let standard = frequency = minutes = workingDays = absences = leave = actualMinutes = actualHours = 0

    let punchInTime
    let result = []
    userData.forEach((user) => {

        user.userAttendance.forEach((item, index) => {

            if (item.isHoliday) return

            if (item.isWeekend) return

            if (item.isOnLeave) {
                leave += 1
                return
            }

            if (item.attendanceCount === 0) {
                absences += 1
                workingDays += 1
                standard += 8
                return
            }

            let { attendance } = item

            punchInTime = moment(
                `${moment(attendance[0].day).format("YYYY-MM-DD")} ${moment(attendance[0].day).format("HH:mm a")}`,
                "YYYY-MM-DD HH:mm a"
            );

            let requiredTime = moment(`${attendance[0].day} 10:00 AM`, "YYYY-MM-DD HH:mm a");
            if (punchInTime.isAfter(requiredTime)) {
                frequency += 1
                minutes += punchInTime.diff(requiredTime, 'minutes');
            }

            workingDays += 1
            standard += 8
            actualHours += item.productionHours
            actualMinutes += item.productionMinutes

            if (actualMinutes > 59) {
                actualHours += Math.floor(actualMinutes / 60);
                actualMinutes = actualMinutes % 60;
            }

        })

        let actual = `${('0' + actualHours).slice(-2)}:${('0' + actualMinutes).slice(-2)}`
        standard = `${('0' + standard).slice(-2)}:00`

        result.push({
            name: user.name, id: user.id, designation: user.designation, workingHours: { standard, actual }, standard, actual, late: { frequency, minutes }, frequency, workingDays, absences, leave, minutes
        })

        standard = frequency = minutes = workingDays = absences = leave = actualMinutes = actualHours = 0



    })





    return result



}


const getAttendanceAbnormalData = (userData) => {

    let currentDate = id = requiredTime = punchIn = punchOut = color2 = punchInTime = undefined

    let result = []
    userData.forEach((user, index) => {

        user.userAttendance.forEach((item) => {

            if (item.isHoliday) return

            if (item.isWeekend) return

            currentDate = moment(item.date).format('YYYY/MM/DD')
            id = index + 1
            if (item.isOnLeave) {
                result.push(makeObject(item.attendance, id, user.name, user.designation, currentDate, 'Leave', 'Leave', 'green', 'green'))
                return
            }

            if (item.attendanceCount === 0) {
                result.push(makeObject(item.attendance, id, user.name, user.designation, currentDate, 'Absent', 'Absent', 'red', 'red'))
                return
            }

            let { attendance } = item

            punchInTime = moment(
                `${moment(attendance[0].day).format("YYYY-MM-DD")} ${moment(attendance[0].day).format("HH:mm a")}`,
                "YYYY-MM-DD HH:mm a"
            );

            requiredTime = moment(`${attendance[0].day} 10:00 AM`, "YYYY-MM-DD HH:mm a");
            punchIn = moment(attendance[0].day).format("HH:mm")
            punchOut = item.pop ? 'missed' : attendance[attendance.length - 1].punchedBy === "System" ? 'missed' : `${moment(attendance[attendance.length - 1].day).format("HH:mm a")}`
            color2 = item.pop ? 'red' : attendance[attendance.length - 1].punchedBy === "System" ? 'red' : `black`

            if (punchInTime.isAfter(requiredTime)) {
                result.push(makeObject(item.attendance, id, user.name, user.designation, currentDate, punchIn, punchOut, 'red', color2, punchInTime.diff(requiredTime, 'minutes')))
                return
            }

            result.push(makeObject(item.attendance, id, user.name, user.designation, currentDate, punchIn, punchOut, color2, color2))
            return
        })

    })
    return result
}

const makeObject = (attendance, id, name, designation, date, In, Out, color1, color2, lateTime = 0) => {

    return {
        attendance, id, name, designation, date, in: In, out: Out, color1, color2, time: { in: In, out: Out, color1, color2 }, lateTime
    }
}


module.exports = {
    makeWhereClause,
    getLeaveAndHoliday,
    timeCalculate,
    getUserAttendances,
    getAttendanceSummaryFilteredData,
    getAttendanceAbnormalData
};
