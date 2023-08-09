var cron = require("node-cron");
const Models = require("../models");
const moment = require("moment");
const Helpers = require("../utils/Helpers");
const { roleIds } = require("../configs/Constants");
const { fn, where, col } = require("sequelize");

module.exports.punchoutCrone = cron.schedule("50 23 * * *", async () => {
  let date = moment(new Date()).format("YYYY-MM-DD");

  let year = new Date().getFullYear();
  let month = new Date().getMonth();
  let today = new Date().getDate();
  let dateTime = new Date(year, month, today, 18, 0);

  let todaytAttendance = await Models.Attendance.findAll({
    where: where(fn("date", col("day")), "=", date),
  });

  let allUsers = await Models.User.findAll({
    where: { roleId: roleIds[1] },
    attributes: ["id"],
  });

  let punchOuts = [];

  allUsers.map((user) => {
    let count = 0;
    todaytAttendance.forEach(function (attendance) {
      if (attendance.userId === user.id) {
        count += 1;
      }
    });

    if (count > 0 && count % 2 === 1) {
      punchOuts.push({ userId: user.id, day: dateTime, punchedBy: "System" });
    }
  });

  if (punchOuts.length > 0) await Models.Attendance.bulkCreate(punchOuts);
});
