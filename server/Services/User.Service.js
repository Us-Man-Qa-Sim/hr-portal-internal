const Models = require("../models");
const { leaveStatusIds, roleIds } = require("../configs/Constants");
let moment = require("moment");
const { Op, fn, where, col, literal } = require("sequelize");
const Helpers = require("../utils/Helpers");
const { getLeavesDates } = require('../Services/Attendance.service');
const e = require("cors");

const calculateEmployeeLeaveData = async (employeeId = "", leaveApplications) => {
  let date = new Date();

  let startDate = moment(new Date(`${date.getFullYear() - 1}-07-01`)).format("YYYY-MM-DD");
  let endDate = moment(startDate).add(11, 'months').endOf('month').format('YYYY-MM-DD')

  if (date.getMonth() + 1 >= 6) {
    startDate = moment(new Date(`${date.getFullYear()}-07-01`)).format("YYYY-MM-DD");
    endDate = moment(startDate).add(11, 'months').endOf('month').format('YYYY-MM-DD')
  }


  // leaveApplications = leaveApplications.filter((leave) => {
  //   let to = moment(leave.to).format('YYYY-MM-DD')
  //   let from = moment(leave.to).format('YYYY-MM-DD')
  //   let isBetween = moment(to).isBetween(startDate, endDate, undefined, '[]') &&
  //     moment(from).isBetween(startDate, endDate, undefined, '[]');

  //   if (isBetween) return leave
  // })

  leaveApplications = returnInDateLeaves(startDate, endDate, leaveApplications)
  // console.log('leaveApplications----->', leaveApplications)
  // let whereCaluse = {
  //   employeeId,
  //   leaveType: "Medical",
  //   leavestatus: leaveStatusIds.Approved,
  //   [Op.or]: [
  //     where(fn("date_part", "year", col("from")), year),
  //     where(fn("date_part", "year", col("to")), year),
  //   ],
  // };

  // let medicalLeves = await Models.LeaveApplication.findAll({
  //   where: whereCaluse,
  // });

  let medicalLeaves = leaveApplications.filter((leave) => {
    if (leave.leaveType == "Medical" && leave.leavestatus == leaveStatusIds.Approved) return leave
  })

  // whereCaluse["leaveType"] = "Casual";
  // let casualLeaves = await Models.LeaveApplication.findAll({
    //   where: whereCaluse,
    // });

  let casualLeaves = leaveApplications.filter((leave) => {
    if (leave.leaveType == "Casual" && leave.leavestatus == leaveStatusIds.Approved) return leave
  })

  let medicalLeavesCount = 0;
  let casualLeavesCount = 0;

  medicalLeaves?.forEach((leave) => {
    let number = parseInt(leave.noOfDays);
    medicalLeavesCount += number;
  });

  casualLeaves?.forEach((leave) => {
    let number = parseInt(leave.noOfDays);
    casualLeavesCount += number;
  });

  return {
    medicalLeaveDays: medicalLeavesCount,
    casualLeavesDays: casualLeavesCount,
    MedicalLeaves: medicalLeaves.length,
    CasualLeaves: casualLeaves.length,
  };
};

const calculateAdminLeaveData = async () => {
  let today = new Date();

  let todaysRecord = await Models.Attendance.findAll({
    where: where(
      fn("date", col("day")),
      "=",
      moment(today).format("YYYY-MM-DD")
    ),
  });

  let todaysLeaveRecord = await Models.LeaveApplication.findAll({
    where: {
      leavestatus: leaveStatusIds.Approved,
      [Op.or]: [
        {
          from: {
            [Op.lte]: today,
          },
        },
        {
          to: {
            [Op.gte]: today,
          },
        },
      ],
    },
  });

  let users = todaysRecord.map((user) => {
    return user.userId;
  });

  users = [...new Set(users)];

  let absentUsers = await Models.User.findAll({
    where: { id: { [Op.notIn]: users }, roleId: roleIds[1], deleted: false },
  });

  absentUsers = absentUsers.map((data) => {
    return data.id;
  });

  let plannedLeaves = 0;

  let pendingApplications = await Models.LeaveApplication.count({
    where: {
      leavestatus: leaveStatusIds.Pending,
    },
  });

  todaysLeaveRecord = Helpers.convertToPlainJSObject(todaysLeaveRecord);

  const compareDate = moment(new Date()).format("YYYY-MM-DD");
  todaysLeaveRecord.forEach((todayLeave) => {
    if (absentUsers.includes(todayLeave.employeeId)) {
      const startDate = moment(todayLeave.from).format("YYYY-MM-DD");
      const endDate = moment(todayLeave.to).format("YYYY-MM-DD");

      const isBetween = moment(compareDate).isBetween(
        startDate,
        endDate,
        undefined,
        "[]"
      );
      if (isBetween) {
        plannedLeaves += 1;
      }
    }
  });

  return {
    totalUsers: absentUsers.length + users.length,
    todayAbsents: absentUsers.length,
    plannedLeaves,
    unPlannedLeaves: absentUsers.length - plannedLeaves,
    pendingApplications,
  };
};

const manageLOP = async (leaves, seeting, check, data, user) => {
  let leaveApplication;
  if (leaves < seeting && leaves + check > seeting) {
    let leaveItems = [];

    let normalLeaves = seeting - leaves;
    let item1 = { ...data };
    item1["to"] = moment(data.from, "YYYY-MM-DD")
      .add(normalLeaves - 1, "days")
      .format("YYYY-MM-DD");
    item1["noOfDays"] = normalLeaves;
    item1["employeeId"] = user.id;
    leaveItems.push(item1);

    let item2 = { ...data };
    let lopDays = check - normalLeaves;
    item2["leaveType"] = "LOP";
    item2["from"] = moment(data.from, "YYYY-MM-DD")
      .add(normalLeaves, "days")
      .format("YYYY-MM-DD");
    item2["to"] = moment(item2.from, "YYYY-MM-DD")
      .add(lopDays - 1, "days")
      .format("YYYY-MM-DD");
    item2["noOfDays"] = lopDays;
    item2["employeeId"] = user.id;
    leaveItems.push(item2);

    leaveApplication = await Models.LeaveApplication.bulkCreate(leaveItems);
  } else {
    leaveApplication = await Models.LeaveApplication.create({
      from: data.from,
      to: data.to,
      leaveType: "LOP",
      reason: data.reason,
      noOfDays: check,
      employeeId: user.id,
    });
  }
  leaveApplication = Helpers.convertToPlainJSObject(leaveApplication);
  return leaveApplication;
};

const check = async () => {

  let allUsers = await Models.User.findAll({
    where: { deleted: false },
    attributes: ['id', 'name', 'email', 'profilePhoto', 'roleId', 'designationId', 'isClient']
  })

  allUsers = Helpers.convertToPlainJSObject(allUsers)
  let employees = allUsers.filter((user) => { if (user.roleId === roleIds[1]) return user })
  let clients = allUsers.filter((user) => { if (user.roleId === roleIds[2]) return user })

  let date = new Date()
  let lateComers = await Models.Attendance.findAll({
    where: where(fn("date", col("day")), "=", moment(date).format("YYYY-MM-DD")),
    attributes: [
      literal('DISTINCT ON("userId") 1'), 'userId', 'day'
    ],

    order: [['userId', 'ASC'], ["day", "ASC"]],

  })
  const startDate = new Date(`${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} 00:00:00`);
  const endDate = new Date(`${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate() + 1} 00:00:00`);
  let leaveCount = 0

  let todaysLeaveRecord = await Models.LeaveApplication.findAll({
    where: {
      leavestatus: leaveStatusIds.Approved,
      [Op.or]: [{
        from: {
          [Op.between]: [startDate, endDate]
        }
      }, {
        to: {
          [Op.between]: [startDate, endDate]
        }
      }]
    },
  });

  // console.log('todaysLeaveRecord-->', Helpers.convertToPlainJSObject(todaysLeaveRecord))
  let todayLeaves = getLeavesDates(todaysLeaveRecord)

  let absentUsers = employees.filter((user) => { if (!lateComers.map((item) => { return item.userId }).includes(user.id)) return user })

  absentUsers = absentUsers.map((absentUser) => {
    let isOnLeave = todayLeaves.find(
      (item) =>
        item.userId === absentUser.id && item.leaveDate === moment(date).format('YYYY-MM-DD')
    );
    if (isOnLeave) {
      absentUser['onLeave'] = true,
        leaveCount = +1
    }

    return absentUser
  })


  let requiredTime = moment(`${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} 10:00 AM`, "YYYY-MM-DD HH:mm a");
  let b = []
  lateComers.forEach((item) => {
    let punchInTime = moment(item.day, "YYYY-MM-DD HH:mm a");
    var after = punchInTime.isAfter(requiredTime);
    if (after) {
      let user = allUsers.find((user) => user.id === item.userId)
      user && (user['punchIn'] = moment(punchInTime).format('hh:mm'),
        user['date'] = moment(punchInTime).format("Do MMMM YYYY"),
        b.push(user))
    }
  });

  // console.log('employees-->', employees.length)
  // console.log('clients-->', clients.length)
  // console.log('absentUsers-->', absentUsers.length)
  // console.log('absentUsers-->', absentUsers)
  // console.log('lateComers-->', b.length)
  // console.log('late comers-->', b)
  // console.log('employees on leave-->', leaveCount)
  // console.log('---------------------------------------------------------------')
  // console.log(startDate, endDate)
  // console.log('---------------------------------------------------------------')


  return {
    employees: employees.length,
    clients: clients.length,
    todayAbsents: absentUsers.length,
    absentUsers: absentUsers,
    todayLateComers: b.length,
    lateComers: b,
    todayOnLeave: leaveCount
  }
}

let returnInDateLeaves = (startDate, endDate, leaveApplications) => {

  leaveApplications = leaveApplications.filter((leave) => {
    let to = moment(leave.to).format('YYYY-MM-DD')
    let from = moment(leave.to).format('YYYY-MM-DD')
    let isBetween = moment(to).isBetween(startDate, endDate, undefined, '[]') &&
      moment(from).isBetween(startDate, endDate, undefined, '[]');

    if (isBetween) return leave
  })
  return leaveApplications
}

module.exports = {
  check,
  returnInDateLeaves,
  manageLOP,
  calculateAdminLeaveData,
  calculateEmployeeLeaveData,
};