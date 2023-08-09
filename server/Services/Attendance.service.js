const Models = require("../models");
const { roleIds, leaveStatusIds } = require("../configs/Constants");
let moment = require("moment");
const Helpers = require("../utils/Helpers");
const { Op, fn, where, col } = require("sequelize");
const urlencode = require("urlencode");

const calculateAttendanceData = (attendance) => {
  let dates = [];
  let object = [];
  attendance?.map((data) => {
    dates.push(moment(data.day).format("YYYY-MM-DD"));
  });
  dates = [...new Set(dates)];

  let allData = {};

  let today = moment(new Date()).format("YYYY-MM-DD");

  dates = dates.filter((date) => {
    if (date !== today) return date;
  });

  dates?.map((date) => {
    let list = [];

    list = attendance.filter((data) => {
      if (moment(data.day).format("YYYY-MM-DD") === date) {
        return data;
      }
    });
    allData[date] = list;
  });

  let checkout = [];
  checkout = dates.map((item) => {
    let returnDate = item;

    let dateData = allData[item];

    let checkIn = moment(dateData[0].day).format("hh:mm A");
    let checkOut = undefined;
    if (dateData.length % 2 === 0) {
      checkOut = moment(dateData[dateData.length - 1].day).format("hh:mm A");
    } else {
      var date = returnDate;
      var time = "18:00";
      let date1 = moment(date + " " + time);
      dateData.push({
        day: date1,
      });
      checkOut = moment(date1).format("hh:mm A");
    }
    let returnTime = calculateTime(dateData);
    let overTimeHours =
      parseInt(returnTime.hours) > 8
        ? `${parseInt(returnTime.hours) - 8}`
        : "0";
    let overTimeMinutes =
      parseInt(returnTime.hours) >= 8 ? `${returnTime.minutes}` : "0";

    let overTime = (`0${overTimeHours}`).slice(-2) + ':' + (`0${overTimeMinutes}`).slice(-2)
    object.push({
      punchIn: checkIn,
      punchOut: checkOut,
      date: returnDate,
      time: {
        productionHours: returnTime.hours,
        productionMinutes: returnTime.minutes,
        breakHours: returnTime.Bhours,
        breakMinutes: returnTime.Bminutes,
        overTimeHours,
        overTimeMinutes,
        overTime,
      },
    });
  });

  if (checkout.length === 0) return checkout;
  else return object;
};

const todayCalculations = (attendance) => {
  let pop = false;
  if (attendance.length % 2 !== 0) {
    var date = moment(attendance[0].day).format("YYYY-MM-DD");
    let d = new Date();
    pop = true;
    var time = `${d.getHours()}:${d.getMinutes()}`;
    console.log(date, time);
    let date1 = moment(`${date} ${time}`, "YYYY-MM-DD HH:mm");

    attendance.push({
      day: date1,
    });
  }

  let returnTime = calculateTime(attendance);

  let overTimeHours =
    parseInt(returnTime.hours) > 8 ? `${parseInt(returnTime.hours) - 8}` : "0";
  let overTimeMinutes =
    parseInt(returnTime.hours) >= 8 ? `${returnTime.minutes}` : "0";
  let overTime = `${
    overTimeHours.length === 2 ? overTimeHours : `0${overTimeHours}`
  }:${
    overTimeMinutes.length === 2 ? overTimeMinutes : `0${overTimeMinutes}`
  } hrs`;

  if (pop) attendance.pop();
  return {
    productionHours: returnTime.hours,
    productionMinutes: returnTime.minutes,
    breakHours: returnTime.Bhours,
    breakMinutes: returnTime.Bminutes,
    overTimeHours,
    overTimeMinutes,
    overTime,
  };
};

const getAttendanceChart = async (query = {}) => {
  let searchByName = undefined;

  if (query?.name)
    searchByName = where(
      fn("LOWER", col("name")),
      "LIKE",
      `%${urlencode.decode(query.name)?.toLowerCase()}%`
    );

  let whereClause = {
    deleted: false,
    roleId: roleIds[1],
    name: searchByName,
    id: query.id ? query.id : undefined,
  };

  Object.keys(whereClause).forEach((item) => {
    if (whereClause[item] === undefined) delete whereClause[item];
  });

  // console.log("query", query);
  // console.log("whereCaluse", whereClause);

  let dateObj = new Date();
  let month = dateObj.getUTCMonth() + 1; //months from 1-12
  let today = dateObj.getDate();
  let year = query.year ? query.year : new Date().getUTCFullYear();

  if (query?.month) {
    month = query.month;
    let date = new Date(year, month - 1, 1);
    let lastDayOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    let noOfDays = lastDayOfMonth.getDate();
    if (
      query.year &&
      parseInt(query.year) === new Date().getUTCFullYear() &&
      parseInt(query.month) === new Date().getMonth() + 1
    ) {
      today = today;
    } else today = noOfDays;
  }

  // console.log("today", today, "month", month);
  // getting all users
  let allUsers = await Models.User.findAll({
    where: whereClause,
    attributes: ["id", "name", "profilePhoto"],
  });

  allUsers = allUsers.map((item) => {
    return Helpers.convertToPlainJSObject(item);
  });

  // getting current month attendance

  let attendances = await Models.Attendance.findAll({
    where: {
      [Op.and]: [
        where(fn("date_part", "year", col("createdAt")), year),
        where(fn("date_part", "month", col("createdAt")), month),
      ],
    },
  });

  attendances = attendances.map((item) => {
    return Helpers.convertToPlainJSObject(item);
  });

  // getting holidays of given month and year

  let holidays = await Models.Holiday.findAll({
    where: {
      [Op.and]: [
        where(fn("date_part", "year", col("date")), year),
        where(fn("date_part", "month", col("date")), month),
      ],
    },
  });

  holidays = holidays.map((item) => {
    return Helpers.convertToPlainJSObject(item);
  });

  let holidaysDates = getHolidaysDates(holidays);

  let leaves = await Models.LeaveApplication.findAll({
    where: {
      leavestatus: leaveStatusIds.Approved,
      [Op.or]: [
        {
          [Op.and]: [
            where(fn("date_part", "year", col("from")), year),
            where(fn("date_part", "month", col("from")), month),
          ],
        },
        {
          [Op.and]: [
            where(fn("date_part", "year", col("to")), year),
            where(fn("date_part", "month", col("to")), month),
          ],
        },
      ],
    },
  });

  let leavesDates = getLeavesDates(leaves);

  let attendanceRecord = [];

  if (allUsers.length === 0 || attendances.length === 0) return [];

  allUsers.map((user) => {
    let userAttendance = attendances.filter((attendanceItem) => {
      if (user.id === attendanceItem.userId) return attendanceItem;
    });

    attendanceRecord.push({
      user,
      userAttendance,
    });
  });

  let lastData = [];
  attendanceRecord.map((item, index) => {
    let list1 = item.userAttendance;
    let list = [];

    for (let i = 1; i <= today; i++) {
      let d = new Date(year, month - 1, i);
      let date = moment(d).format("YYYY-MM-DD");
      let check = list1.filter((item) => {
        if (date === moment(item.day).format("YYYY-MM-DD")) return item;
      });

      list.push({
        date,
        list: check,
      });
    }
    lastData.push({
      user: item.user,
      userAttendance: list,
    });
  });
  let allEmployeeAttendance = [];

  let currentDay =
    parseInt(month) === dateObj.getMonth() + 1 &&
    parseInt(year) === dateObj.getFullYear() &&
    dateObj.getDate() === today;

  let pop = false;
  lastData.map((data) => {
    let newList = [];
    data.userAttendance.map((attendance, index) => {
      pop = false;
      if (attendance.list.length % 2 !== 0) {
        var date = attendance.date;
        var time =
          index + 1 === today && currentDay
            ? `${dateObj.getHours()}:${dateObj.getMinutes()}`
            : "18:00";

        let date1 = moment(`${date} ${time}`, "YYYY-MM-DD HH:mm");

        attendance.list.push({
          day: date1,
        });
        pop = true;
      }
      let returnTime = calculateTime(attendance.list);

      var weekDay = moment(attendance.date).format("dddd");

      let isWeekend =
        weekDay === "Saturday" || weekDay === "Sunday" ? true : false;

      let Holiday = holidaysDates.find(
        (item) => item.holidayDate === attendance.date
      );

      let isOnLeave = leavesDates.find(
        (item) =>
          item.userId === data.user.id && item.leaveDate === attendance.date
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
        date: attendance.date,
        isWeekend,
        isholiday: Holiday === undefined ? false : true,
        holiday: Holiday === undefined ? {} : Holiday,
        isOnLeave: isOnLeave === undefined ? false : true,
        leave: isOnLeave === undefined ? {} : isOnLeave,
        activity: attendance.list,
        istoday: false,
      };

      if (index + 1 === dateObj.getDate() && currentDay) {
        let todayArray = record.activity;
        pop ? todayArray.pop() : todayArray;
        // todayArray = todayArray.reverse().pop();
        record["status"] = todayArray.length % 2;
        record["activity"] = todayArray;
        record["istoday"] = true;
      }
      newList.push(record);
    });

    allEmployeeAttendance.push({
      user: data.user,
      attendance: newList,
    });
  });

  return allEmployeeAttendance;
};

const employeeStatistics = (attendanceSummary = []) => {
  let weekStart = moment().startOf("isoWeek").add(0, "day");
  let weekEnd = moment().startOf("isoWeek").add(4, "day");

  var weekDates = [];
  let startDate = weekStart;
  let endDate = weekEnd.add(1, "days");
  while (startDate.format("YYYY-MM-DD") !== endDate.format("YYYY-MM-DD")) {
    weekDates.push(startDate.format("YYYY-MM-DD"));
    startDate = startDate.add(1, "days");
  }

  let Hours = 0;
  let Minutes = 0;

  weekDates.map((thisDate) => {
    var result = attendanceSummary.find((item) => item.date === thisDate);
    if (result) {
      let { time } = result;
      Hours += parseInt(time.productionHours);
      Minutes += parseInt(time.productionMinutes);
    }
  });
  if (Minutes > 59) {
    Hours += Math.floor(Minutes / 60);
    Minutes = Minutes % 60;
  }

  let week = {
    hours: Hours,
    minutes: Minutes,
  };

  const currentMonthDates = new Array(moment().daysInMonth())
    .fill(null)
    .map((x, i) => moment().startOf("month").add(i, "days"));

  let monthDays = [];
  let today = new Date().getUTCDate();
  currentMonthDates.map((item, index) => {
    const day = moment(item).format("dddd");
    const date = moment(item).format("YYYY-MM-DD");
    if (index + 1 < today) {
      monthDays.push({
        day,
        date,
      });
    }
  });

  let mHours = 0;
  let mMinutes = 0;

  monthDays.map((thisDate) => {
    var result = attendanceSummary.find((item) => item.date === thisDate.date);
    if (result) {
      let { time } = result;
      mHours += parseInt(time.productionHours);
      mMinutes += parseInt(time.productionMinutes);
    }
  });
  if (mMinutes > 59) {
    mHours += Math.floor(mMinutes / 60);
    mMinutes = mMinutes % 60;
  }

  let month = {
    hours: mHours,
    minutes: mMinutes,
  };
  return { week, month };
};

const makeAttendanceWhereCaluse = async (user, query) => {
  let whereClause = undefined;

  if (Object.keys(query).length === 0 || query?.date) {
    whereClause = {
      userId: user.id,
    };
  } else {
    if (query.month) {
      if (!query.year) {
        var dateObj = new Date();
        var year = dateObj.getUTCFullYear();

        whereClause = {
          userId: user.id,
          [Op.and]: [
            where(fn("date_part", "year", col("day")), year),
            where(fn("date_part", "month", col("day")), query.month),
          ],
        };
      }
      if (query.year) {
        whereClause = {
          userId: user.id,
          [Op.and]: [
            where(fn("date_part", "year", col("day")), query.year),
            where(fn("date_part", "month", col("day")), query.month),
          ],
        };
      }
    } else {
      if (!query.month) {
        var dateObj = new Date();
        var year = dateObj.getUTCFullYear();

        whereClause = {
          userId: user.id,
          [Op.and]: [where(fn("date_part", "year", col("day")), query.year)],
        };
      }
      if (query.month) {
        whereClause = {
          userId: user.id,
          [Op.and]: [
            where(fn("date_part", "year", col("day")), query.year),
            where(fn("date_part", "month", col("day")), query.month),
          ],
        };
      }
    }
  }

  return whereClause;
};

const calculateTime = (attendance) => {
  let punchIns = [];
  let punchOuts = [];

  attendance.map((record, index) => {
    if (index % 2 === 0) punchIns.push(record);
    else punchOuts.push(record);
  });
  let hours = 0;
  let minutes = 0;

  for (let i = 0; i < punchIns.length; i++) {
    let In = moment(punchIns[i].day).format("hh:mm a");
    let out = moment(punchOuts[i].day).format("hh:mm a");
    let duration = moment.duration(
      moment(out, "hh:mm a").diff(moment(In, "hh:mm a"))
    );

    let h = parseInt(duration.asHours());
    let m = parseInt(duration.asMinutes()) % 60;
    hours += h;
    minutes += m;
  }
  if (minutes > 59) {
    hours += Math.floor(minutes / 60);
    minutes = minutes % 60;
  }

  let Bhours = 0;
  let Bminutes = 0;
  for (let i = 0; i < punchOuts.length; i++) {
    let out = moment(punchOuts[i].day).format("hh:mm a");
    if (i + 1 > punchIns.length - 1) break;
    let In = moment(punchIns[i + 1].day).format("hh:mm a");
    let duration = moment.duration(
      moment(In, "hh:mm a").diff(moment(out, "hh:mm a"))
    );

    let h = parseInt(duration.asHours());
    let m = parseInt(duration.asMinutes()) % 60;
    Bhours += h;
    Bminutes += m;
  }
  if (Bminutes > 59) {
    Bhours += Math.floor(Bminutes / 60);
    Bminutes = Bminutes % 60;
  }

  let result = hours >= 8 ? 1 : hours >= 4 ? 2 : 0;

  return { hours, minutes, Bhours, Bminutes, result };
};

const getHolidaysDates = (holidays) => {
  let holidaysDates = [];
  holidays.map((item) => {
    let Start = moment(item.date);
    let End = moment(item.date).add(item.days - 1, "day");
    let startDate = Start;
    let endDate = End.add(1, "days");
    while (startDate.format("YYYY-MM-DD") !== endDate.format("YYYY-MM-DD")) {
      holidaysDates.push({
        holidayDate: startDate.format("YYYY-MM-DD"),
        holidayName: item.holidayName,
      });
      startDate = startDate.add(1, "days");
    }
  });

  return holidaysDates;
};

const getLeavesDates = (leaves) => {
  let leavesDates = [];
  leaves.map((item) => {
    let Start = moment(item.from);
    let End = moment(item.to)
    // let End = moment(item.to).add(item.noOfDays - 1, "day");
    let startDate = Start;
    let endDate = End.add(1, "days");
    while (startDate.format("YYYY-MM-DD") !== endDate.format("YYYY-MM-DD")) {
      leavesDates.push({
        leaveDate: startDate.format("YYYY-MM-DD"),
        userId: item.employeeId,
        leaveType: item.leaveType,
        from: moment(item.from).format("YYYY-MM-DD"),
        to: moment(item.to).format("YYYY-MM-DD"),
        reason: item.reason,
        noOfDays: item.noOfDays,
      });
      startDate = startDate.add(1, "days");
    }
  });

  return leavesDates;
};

let dummy = {
  "id": "888f7e00-bb5f-47b9-83a6-da2919cd9612",
  "name": "Shah Rukh Khan",
  "profilePhoto": "https://portal.emifusion.com/api/v2/users/image/storage/user/Group 22.png",
  "createdAt": "2022-09-13",
  "userAttendance": [
    {
      "attendanceCount": 1,
      "date": "2023-02-01",
      "attendance": [
        {
          "id": "da73fb89-ebcb-4da0-ac6b-e749d301588b",
          "day": "2023-02-01T04:23:16.171Z",
          "userId": "888f7e00-bb5f-47b9-83a6-da2919cd9612",
          "punchedBy": "User",
          "createdAt": "2023-02-01T04:23:16.171Z",
          "updatedAt": "2023-02-01T04:23:16.171Z"
        },
        {
          "day": "2023-02-01T13:00:00.000Z"
        }
      ],
      "status": 1,
      "productionHours": 8,
      "productionMinutes": 37,
      "breakHours": 0,
      "breakMinutes": 0,
      "overTimeHours": "0",
      "overTimeMinutes": "37",
      "overTime": "00:37",
      "isWeekend": false,
      "isHoliday": false,
      "holiday": {},
      "isOnLeave": false,
      "leave": {},
      "pop": true
    },
    {
      "attendanceCount": 2,
      "date": "2023-02-02",
      "attendance": [
        {
          "id": "93216f70-1223-4110-9c39-e299517aa643",
          "day": "2023-02-02T04:35:41.422Z",
          "userId": "888f7e00-bb5f-47b9-83a6-da2919cd9612",
          "punchedBy": "User",
          "createdAt": "2023-02-02T04:35:41.423Z",
          "updatedAt": "2023-02-02T04:35:41.423Z"
        },
        {
          "id": "f1e8b763-39a4-47d5-a3e7-c213a9dbcbb5",
          "day": "2023-02-02T13:00:00.000Z",
          "userId": "888f7e00-bb5f-47b9-83a6-da2919cd9612",
          "punchedBy": "System",
          "createdAt": "2023-02-02T18:50:00.426Z",
          "updatedAt": "2023-02-02T18:50:00.426Z"
        }
      ],
      "status": 1,
      "productionHours": 8,
      "productionMinutes": 25,
      "breakHours": 0,
      "breakMinutes": 0,
      "overTimeHours": "0",
      "overTimeMinutes": "25",
      "overTime": "00:25",
      "isWeekend": false,
      "isHoliday": false,
      "holiday": {},
      "isOnLeave": false,
      "leave": {},
      "pop": false
    },
    {
      "attendanceCount": 2,
      "date": "2023-02-03",
      "attendance": [
        {
          "id": "24b855e8-2ed3-4707-9e62-6ecb563de09e",
          "day": "2023-02-03T05:15:01.321Z",
          "userId": "888f7e00-bb5f-47b9-83a6-da2919cd9612",
          "punchedBy": "User",
          "createdAt": "2023-02-03T05:15:01.321Z",
          "updatedAt": "2023-02-03T05:15:01.321Z"
        },
        {
          "id": "96d45cbb-4653-46f0-a74f-1533bdc05b8d",
          "day": "2023-02-03T13:00:00.000Z",
          "userId": "888f7e00-bb5f-47b9-83a6-da2919cd9612",
          "punchedBy": "System",
          "createdAt": "2023-02-03T18:50:00.379Z",
          "updatedAt": "2023-02-03T18:50:00.379Z"
        }
      ],
      "status": 2,
      "productionHours": 7,
      "productionMinutes": 45,
      "breakHours": 0,
      "breakMinutes": 0,
      "overTimeHours": "0",
      "overTimeMinutes": "0",
      "overTime": "00:00",
      "isWeekend": false,
      "isHoliday": false,
      "holiday": {},
      "isOnLeave": false,
      "leave": {},
      "pop": false
    },
    {
      "attendanceCount": 0,
      "date": "2023-02-04",
      "attendance": [],
      "status": 0,
      "productionHours": 0,
      "productionMinutes": 0,
      "breakHours": 0,
      "breakMinutes": 0,
      "overTimeHours": "0",
      "overTimeMinutes": "0",
      "overTime": "00:00",
      "isWeekend": true,
      "isHoliday": false,
      "holiday": {},
      "isOnLeave": false,
      "leave": {},
      "pop": false
    },
    {
      "attendanceCount": 0,
      "date": "2023-02-05",
      "attendance": [],
      "status": 0,
      "productionHours": 0,
      "productionMinutes": 0,
      "breakHours": 0,
      "breakMinutes": 0,
      "overTimeHours": "0",
      "overTimeMinutes": "0",
      "overTime": "00:00",
      "isWeekend": true,
      "isHoliday": false,
      "holiday": {},
      "isOnLeave": false,
      "leave": {},
      "pop": false
    },
    {
      "attendanceCount": 2,
      "date": "2023-02-06",
      "attendance": [
        {
          "id": "eb9efc86-e833-4bdd-ade2-0c4fb0d730ac",
          "day": "2023-02-06T04:39:49.246Z",
          "userId": "888f7e00-bb5f-47b9-83a6-da2919cd9612",
          "punchedBy": "User",
          "createdAt": "2023-02-06T04:39:49.246Z",
          "updatedAt": "2023-02-06T04:39:49.246Z"
        },
        {
          "id": "29d7f74a-b222-4958-af7b-41d57742015f",
          "day": "2023-02-06T13:00:00.000Z",
          "userId": "888f7e00-bb5f-47b9-83a6-da2919cd9612",
          "punchedBy": "System",
          "createdAt": "2023-02-06T18:50:00.126Z",
          "updatedAt": "2023-02-06T18:50:00.126Z"
        }
      ],
      "status": 1,
      "productionHours": 8,
      "productionMinutes": 21,
      "breakHours": 0,
      "breakMinutes": 0,
      "overTimeHours": "0",
      "overTimeMinutes": "21",
      "overTime": "00:21",
      "isWeekend": false,
      "isHoliday": false,
      "holiday": {},
      "isOnLeave": false,
      "leave": {},
      "pop": false
    },
    {
      "attendanceCount": 2,
      "date": "2023-02-07",
      "attendance": [
        {
          "id": "5aabe022-05ff-48d8-8601-aa850be31ffb",
          "day": "2023-02-07T04:50:37.709Z",
          "userId": "888f7e00-bb5f-47b9-83a6-da2919cd9612",
          "punchedBy": "User",
          "createdAt": "2023-02-07T04:50:37.709Z",
          "updatedAt": "2023-02-07T04:50:37.709Z"
        },
        {
          "id": "7d73f813-82a1-4c0e-9ab4-d2c23b9261aa",
          "day": "2023-02-07T12:15:26.007Z",
          "userId": "888f7e00-bb5f-47b9-83a6-da2919cd9612",
          "punchedBy": "User",
          "createdAt": "2023-02-07T12:15:26.007Z",
          "updatedAt": "2023-02-07T12:15:26.007Z"
        }
      ],
      "status": 2,
      "productionHours": 7,
      "productionMinutes": 25,
      "breakHours": 0,
      "breakMinutes": 0,
      "overTimeHours": "0",
      "overTimeMinutes": "0",
      "overTime": "00:00",
      "isWeekend": false,
      "isHoliday": false,
      "holiday": {},
      "isOnLeave": false,
      "leave": {},
      "pop": false
    }
  ]
}
let dummy1 = {
  "id": "6b8c6a62-3950-46d5-b6ff-ac99c95a738b",
  "name": "Muhammad Abdullah",
  "profilePhoto": "https://portal.emifusion.com/api/v2/users/image/storage/user/Screenshot 2022-09-28 165236.png",
  "createdAt": "2022-09-13",
  "designation": "ALPHA",
  "userAttendance": [
    {
      "attendanceCount": 1,
      "date": "2023-02-01",
      "attendance": [
        {
          "id": "9a4ad6db-61bb-4515-b952-7e9646d35355",
          "day": "2023-02-01T06:16:58.360Z",
          "userId": "6b8c6a62-3950-46d5-b6ff-ac99c95a738b",
          "punchedBy": "User",
          "createdAt": "2023-02-01T06:16:58.360Z",
          "updatedAt": "2023-02-01T06:16:58.360Z"
        },
        {
          "day": "2023-02-01T13:00:00.000Z"
        }
      ],
      "status": 2,
      "productionHours": 6,
      "productionMinutes": 44,
      "breakHours": 0,
      "breakMinutes": 0,
      "overTimeHours": "0",
      "overTimeMinutes": "0",
      "overTime": "00:00",
      "isWeekend": false,
      "isHoliday": false,
      "holiday": {},
      "isOnLeave": false,
      "leave": {},
      "pop": true
    },
    {
      "attendanceCount": 0,
      "date": "2023-02-02",
      "attendance": [],
      "status": 0,
      "productionHours": 0,
      "productionMinutes": 0,
      "breakHours": 0,
      "breakMinutes": 0,
      "overTimeHours": "0",
      "overTimeMinutes": "0",
      "overTime": "00:00",
      "isWeekend": false,
      "isHoliday": false,
      "holiday": {},
      "isOnLeave": false,
      "leave": {},
      "pop": false
    },
    {
      "attendanceCount": 0,
      "date": "2023-02-03",
      "attendance": [],
      "status": 0,
      "productionHours": 0,
      "productionMinutes": 0,
      "breakHours": 0,
      "breakMinutes": 0,
      "overTimeHours": "0",
      "overTimeMinutes": "0",
      "overTime": "00:00",
      "isWeekend": false,
      "isHoliday": false,
      "holiday": {},
      "isOnLeave": true,
      "leave": {
        "leaveDate": "2023-02-03",
        "userId": "6b8c6a62-3950-46d5-b6ff-ac99c95a738b",
        "leaveType": "Casual",
        "from": "2023-02-03",
        "to": "2023-02-08",
        "reason": "urgent home visit",
        "noOfDays": "4"
      },
      "pop": false
    },
    {
      "attendanceCount": 0,
      "date": "2023-02-04",
      "attendance": [],
      "status": 0,
      "productionHours": 0,
      "productionMinutes": 0,
      "breakHours": 0,
      "breakMinutes": 0,
      "overTimeHours": "0",
      "overTimeMinutes": "0",
      "overTime": "00:00",
      "isWeekend": true,
      "isHoliday": false,
      "holiday": {},
      "isOnLeave": true,
      "leave": {
        "leaveDate": "2023-02-04",
        "userId": "6b8c6a62-3950-46d5-b6ff-ac99c95a738b",
        "leaveType": "Casual",
        "from": "2023-02-03",
        "to": "2023-02-08",
        "reason": "urgent home visit",
        "noOfDays": "4"
      },
      "pop": false
    },
    {
      "attendanceCount": 0,
      "date": "2023-02-05",
      "attendance": [],
      "status": 0,
      "productionHours": 0,
      "productionMinutes": 0,
      "breakHours": 0,
      "breakMinutes": 0,
      "overTimeHours": "0",
      "overTimeMinutes": "0",
      "overTime": "00:00",
      "isWeekend": true,
      "isHoliday": false,
      "holiday": {},
      "isOnLeave": true,
      "leave": {
        "leaveDate": "2023-02-05",
        "userId": "6b8c6a62-3950-46d5-b6ff-ac99c95a738b",
        "leaveType": "Casual",
        "from": "2023-02-03",
        "to": "2023-02-08",
        "reason": "urgent home visit",
        "noOfDays": "4"
      },
      "pop": false
    },
    {
      "attendanceCount": 0,
      "date": "2023-02-06",
      "attendance": [],
      "status": 0,
      "productionHours": 0,
      "productionMinutes": 0,
      "breakHours": 0,
      "breakMinutes": 0,
      "overTimeHours": "0",
      "overTimeMinutes": "0",
      "overTime": "00:00",
      "isWeekend": false,
      "isHoliday": false,
      "holiday": {},
      "isOnLeave": true,
      "leave": {
        "leaveDate": "2023-02-06",
        "userId": "6b8c6a62-3950-46d5-b6ff-ac99c95a738b",
        "leaveType": "Casual",
        "from": "2023-02-03",
        "to": "2023-02-08",
        "reason": "urgent home visit",
        "noOfDays": "4"
      },
      "pop": false
    },
    {
      "attendanceCount": 0,
      "date": "2023-02-07",
      "attendance": [],
      "status": 0,
      "productionHours": 0,
      "productionMinutes": 0,
      "breakHours": 0,
      "breakMinutes": 0,
      "overTimeHours": "0",
      "overTimeMinutes": "0",
      "overTime": "00:00",
      "isWeekend": false,
      "isHoliday": false,
      "holiday": {},
      "isOnLeave": true,
      "leave": {
        "leaveDate": "2023-02-07",
        "userId": "6b8c6a62-3950-46d5-b6ff-ac99c95a738b",
        "leaveType": "Casual",
        "from": "2023-02-03",
        "to": "2023-02-08",
        "reason": "urgent home visit",
        "noOfDays": "4"
      },
      "pop": false
    }
  ]
}

module.exports = {
  getHolidaysDates,
  calculateAttendanceData,
  getLeavesDates,
  todayCalculations,
  getAttendanceChart,
  employeeStatistics,
  makeAttendanceWhereCaluse,
  calculateTime,
  dummy,
  dummy1,
};
