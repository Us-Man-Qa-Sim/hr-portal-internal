var cron = require("node-cron");
const Models = require("../models");
const moment = require("moment");
const Helpers = require("../utils/Helpers");
const {
  getHolidaysDates,
  getLeavesDates,
} = require("../Services/Attendance.service");
const { roleIds, leaveStatusIds } = require("../configs/Constants");
const { fn, where, col, Op } = require("sequelize");
const { email } = require("../email/sendPaySlip");

module.exports.AttendanceReminder = cron.schedule("50 9 * * 1-5", async () => {
// module.exports.AttendanceReminder = cron.schedule("*/10 * * * * * ", async () => {
  //Checking Weekend

  let today = new Date();

  var weekDay = moment(today).format("dddd");
  let isWeekend = weekDay === "Saturday" || weekDay === "Sunday";

  if (isWeekend) return;

  //Checking Holiday

  let year = new Date().getFullYear();
  let month = new Date().getMonth();

  let holidays = await Models.Holiday.findAll({
    where: {
      [Op.and]: [
        where(fn("date_part", "year", col("date")), year),
        where(fn("date_part", "month", col("date")), month),
      ],
    },
  });

  let holidaysDates = getHolidaysDates(holidays);
  let todayDate = moment(today).format("YYYY-MM-DD");

   var isHoliday = holidaysDates.find((item) => item.holidayDate === todayDate);

   if (isHoliday) return;

   // let leaves = await Models.LeaveApplication.findAll({
   //   where: {
   //     leavestatus: leaveStatusIds.Approved,
   //     [Op.or]: [
   //       {
   //         [Op.and]: [
   //           where(fn("date_part", "year", col("from")), year),
   //           where(fn("date_part", "month", col("from")), month),
   //         ],
   //       },
   //       {
   //         [Op.and]: [
   //           where(fn("date_part", "year", col("to")), year),
   //           where(fn("date_part", "month", col("to")), month),
   //         ],
   //       },
   //     ],
   //   },
   // });

   // leaves = Helpers.convertToPlainJSObject(leaves);


   const startDate = new Date(`${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()} 00:00:00`);
  const endDate = moment(startDate).add(1, 'days')

   // console.log(moment(endDate).format('YYYY-MM-DD,h:mm:ss a'))

   let todaysLeaveRecord = await Models.LeaveApplication.findAll({
    where: {
      leavestatus: leaveStatusIds.Approved,
      // from: {
      //   [Op.lte]: startDate
      // },
      // to: {
      //   [Op.gte]: startDate
      // },
       from: {
         [Op.lte]: endDate
      },
      to: {
        [Op.gte]: startDate
      },
    },
   });

  // console.log(Helpers.convertToPlainJSObject(todaysLeaveRecord))
  // let todaysLeaveRecord = await Models.LeaveApplication.findAll({
  //   where: {
  //     leavestatus: leaveStatusIds.Approved,
  //     from: {
  //       [Op.lte]: endDate
  //     },
  //     to: {
  //       [Op.gte]: startDate
  //     },
  //   },
  // });


  //Getting those users which are on leave(accepted) today

   // let leavesDates = getLeavesDates(leaves);
  let leavesDates = getLeavesDates(todaysLeaveRecord);

  leavesDates = leavesDates.filter((item) => {
    if (item.leaveDate === todayDate) return item;
  });
  let approvedLeaveUsers = [];

  leavesDates.map((user) => {
    approvedLeaveUsers.push(user.userId);
  });

  approvedLeaveUsers = [...new Set(approvedLeaveUsers)];


  //Getting Today

  let date = moment(new Date()).format("YYYY-MM-DD");
   let todayAttendance = await Models.Attendance.findAll({
    where: where(fn("date", col("day")), "=", date),
  });

   todayAttendance.map((user) => {
    // let count = 0;

    // todayAttendance.forEach(function (attendance) {
    //   if (attendance.userId === user.userId) {
    //     count += 1;
    //   }
    // });

    const count = todayAttendance.filter((attendance) => attendance.userId === user.userId).length;

    if (count % 2 === 1) approvedLeaveUsers.push(user.userId);
  });

  approvedLeaveUsers = [...new Set(approvedLeaveUsers)];

  //Getting users

  let allUsers = await Models.User.findAll({
    where: { id: { [Op.notIn]: approvedLeaveUsers }, roleId: roleIds[1], deleted: false },
    attributes: ["id", "email", 'name'],
  });

  allUsers = Helpers.convertToPlainJSObject(allUsers);

  if (allUsers.length === 0) return;

  await email({
    to: allUsers.map((user) => { return user.email }),
    subject: "Attendance Reminder",
    html: `<b>Don't forget to mark your today's attendance</b>`,
    attachments: null,
  });
});
