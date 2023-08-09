const Models = require("../models");
const AppError = require("../utils/AppError");
const CatchAsync = require("../utils/CatchAsync");
const Helpers = require("../utils/Helpers");
// const Paginate = require("../utils/Paginate");
const Services = require("../Services/Dashboard.service");
const { countTickets } = require("../Services/Ticket.service");
// const { createPDF } = require("../Pdf/paySlip");
// const { roleIds, StatusIds, leaveStatusIds } = require("../configs/Constants");
let { Op, where, fn, col } = require("sequelize");
const { StatusIds } = require("../configs/Constants");
// const moment = require("moment");
// const { calculateAttendanceData } = require("../Services/Attendance.service");

module.exports.getDashboardData = CatchAsync(async (req, res, next) => {
  let taskStatistics = await Services.getTaskStatistics(req);
  let assignedTasks = await Services.getTasks(req);
  let timeSpent = await Services.getTimeSpent(req);
  let projects = await Services.getProjects(req);
  let leaveStatistics = await Services.getLeaveStatistics(req);
  let teamAbsents = await Services.getTeamAbsents(req);

  return res.status(200).json({
    status: "success",
    message: "Employee Dashboard's data is Fetched successfully",
    data: {
      taskStatistics,
      assignedTasks,
      timeSpent,
      projects,
      leaveStatistics,
      teamAbsents,
    },
  });
});

module.exports.getAdminDashboardData = CatchAsync(async (req, res, next) => {

  let sprint = await Models.Sprint.findOne({
    where: {
      startDate: {
        [Op.lte]: new Date(),
      },
      endDate: {
        [Op.gte]: new Date(),
      },
    },
  });

  let employeeStatistics = await Services.getCompanyEmployeeStatistics()
  let ticketStatistics = await countTickets({})
  let taskStatistics = await Services.getTaskStatistics(req, sprint.id);
  let projectStatistics = await Services.getProjectStatistics();

  return res.status(200).json({
    status: "success",
    message: "Admin Dashboard's data is Fetched successfully",
    data: {
      employeeStatistics,
      ticketStatistics,
      taskStatistics,
      projectStatistics
    },
  });
})

module.exports.getLeadDashboardData = CatchAsync(async (req, res, next) => {

  const { user, query } = req
  // let projects = await Models.Project.findAll({
  //   where: { deleted: false },
  //   attributes: ['id', 'title', 'progress', 'startDate', 'deadline'],
  //   include: [{
  //     model: Models.ProjectEmployee,
  //     where: {
  //       employeeId: user.id, isLead: true
  //     },
  //     required: true,
  //     attributes: ['isLead', 'id',],
  //   }]
  // })


  let projects = await Services.getInLeadProjects(user)

  if (projects.length === 0) return next(new AppError("No project has found", 404));

  let sprint = await Helpers.getCurrentSprintNumber()

  let sprintReviewTask = await Services.getSprintReviewTask(projects, sprint)

  // let sprintReviewTask = await Models.Task.findAll({
  //   where: {
  //     deleted: false, sprintId: sprint.id, statusId: StatusIds.Testing,
  //     projectId: { [Op.in]: projects.map((project) => { return project.id }) }
  //   },
  //   attributes: ['title', 'priority'],
  //   include: [{
  //     model: Models.User,
  //     as: "employee",
  //     attributes: ["name", "profilePhoto"],
  //   },]
  // })

  let projectTeamMembers = await Services.getProjectTeamMembers(projects, user)

  // let teamMembers = await Models.ProjectEmployee.findAll({
  //   where: { projectId: { [Op.in]: projects.map((project) => { return project.id }) } },
  //   include: [
  //     {
  //       model: Models.User,
  //       attributes: ["id", "name", "email", "profilePhoto"],
  //     },
  //     { model: Models.Project, attributes: ['title'] }
  //   ],
  // });

  // let projectTeamMembers = [];

  // teamMembers = Helpers.convertToPlainJSObject(teamMembers)

  // teamMembers.forEach((teamMember) => {
  //   const { user: teamUser } = teamMember;
  //   if (teamUser.id === user.id) return;
  //   teamUser['projectTitle'] = teamMember.project.title
  //   teamUser['projectId'] = teamMember.projectId
  //   return projectTeamMembers.push(teamUser);
  // });

  let sprintProgress = await Services.getSprintProgress(projects, sprint, query)

  // let projectId = query?.projectId ? query.projectId : projects[0].id

  // let sprintId = query?.sprintId ? query?.sprintId : sprint.id

  // let sprintProgress = []
  // let taskLog = await Models.TaskLog.findAll({ where: { projectId, sprintId } })


  // let projectEmployees = taskLog.map((member) => { return member.userId })
  // projectEmployees = [...new Set(projectEmployees)]

  // if (projectEmployees.length > 0) {

  //   projectEmployees = await Models.User.findAll({ where: { id: { [Op.in]: projectEmployees } }, attributes: ['id', 'name', 'email'] })

  //   projectEmployees?.forEach((projectEmployee) => {

  //     let tasks = taskLog.filter((task) => task.userId === projectEmployee.id)

  //     let data = {
  //       userName: projectEmployee.name,
  //       userEmail: projectEmployee.email,
  //       total: tasks.length,
  //       completed: tasks.filter((task) => task.statusId === StatusIds.Complete).length,
  //       underReview: tasks.filter((task) => task.statusId === StatusIds.Testing).length,
  //       shifted: tasks.filter((task) => task.shifted === true).length,
  //       incomplete: tasks.filter((task) => task.statusId === StatusIds.Pending || task.statusId === StatusIds.Progress).length
  //     }
  //     sprintProgress.push(data)
  //   })
  // }

  return res.status(201).json({
    status: "success",
    message: "Lead Dashboard data fetched successfully",
    data: { sprintReviewTask, sprint, projects, team: projectTeamMembers, sprintProgress },
  });

})

// module.exports.getTaskStatistics = CatchAsync(async (req, res, next) => {
//   const { user } = req;

//   let tasks = await Models.Task.findAll({ where: { employeeId: user.id } });

//   let pending = (progress = complete = testing = cancel = 0);
//   tasks.forEach((task) => {
//     if (task.statusId === StatusIds.Pending) pending += 1;
//     if (task.statusId === StatusIds.Progress) progress += 1;
//     if (task.statusId === StatusIds.Complete) complete += 1;
//     if (task.statusId === StatusIds.Testing) testing += 1;
//     if (task.statusId === StatusIds.Cancel) cancel += 1;
//   });

//   return res.status(201).json({
//     status: "success",
//     message: "Task fetched successfully",
//     data: { pending, progress, complete, testing, cancel },
//   });
// });

// module.exports.getTasks = CatchAsync(async (req, res, next) => {
//   const { user, query } = req;

//   let todayDate = new Date();

//   let sprint = await Models.Sprint.findOne({
//     where: {
//       startDate: {
//         [Op.lte]: todayDate,
//       },
//       endDate: {
//         [Op.gte]: todayDate,
//       },
//     },
//   });

//   let whereCaluse = { employeeId: user.id, sprintId: sprint.id };
//   const pagination = await Paginate(
//     Models.Task,
//     whereCaluse,
//     query.page,
//     query.limit
//   );

//   tasks = await Models.Task.findAll({
//     where: whereCaluse,
//     order: [["createdAt", "DESC"]],
//     limit: pagination.limit,
//     offset: pagination.offset,
//   });

//   tasks = Helpers.convertToPlainJSObject(tasks);

//   return res.status(201).json({
//     status: "success",
//     message: "Task fetched successfully",
//     data: { pagination, tasks },
//   });
// });

// module.exports.getTimeSpents = CatchAsync(async (req, res, next) => {
//   const { user } = req;
//   let times = await Models.Attendance.findAll({
//     where: {
//       userId: user.id,
//     },
//   });
//   times = Helpers.convertToPlainJSObject(times);
//   times = calculateAttendanceData(times);

//   // var startTime = moment("10:01 AM", "HH:mm a");
//   // var onTimetime = moment("10:00 AM", "HH:mm a");
//   // console.log(startTime.isSameOrBefore(onTimetime));

//   let onTime = 0;

//   times.forEach((day) => {
//     let punchInTime = moment(
//       `${day.date} ${day.punchIn}`,
//       "YYYY-MM-DD HH:mm a"
//     );
//     let requiredTime = moment(`${day.date} 10:00 AM`, "YYYY-MM-DD HH:mm a");
//     var before = punchInTime.isBefore(requiredTime);
//     if (before) onTime += 1;
//   });

//   let weekTimes = getWeekDaysTime(times);

//   return res.status(200).json({
//     status: "success",
//     message: "Time spent is Fetched successfully",
//     data: { onTime, late: times.length - onTime, weekTimes },
//   });
// });

// module.exports.coursesAndTrainings = CatchAsync(async (req, res, next) => {
//   return res.status(200).json({
//     status: "success",
//     message: `Salary and his Incentives are deleted successfully`,
//     // id,
//   });
// });

// module.exports.getPtojects = CatchAsync(async (req, res, next) => {
//   const { user } = req;

//   let projects = await getUserProjects(user.id);

//   return res.status(201).json({
//     status: "success",
//     message: "user projects fetched successfully",
//     data: {
//       projects,
//     },
//   });
// });

// module.exports.getMeetings = CatchAsync(async (req, res, next) => {
//   if (result) {
//     return res.status(200).json({
//       status: "success",
//       message: "Salary detail Fetched successfully",
//       data: {
//         // ...result,
//       },
//     });
//   }
// });

// module.exports.getLeaveStatistics = CatchAsync(async (req, res, next) => {
//   const { user } = req;

//   const totalLeaves = await Models.LeaveApplication.findOne({
//     where: { employeeId: user.id, leavestatus: leaveStatusIds.Approved },
//     attributes: ["employeeId", [fn("sum", col("noOfDays")), "totalLeaves"]],
//     group: ["employeeId"],
//     raw: true,
//   });

//   const userLeaves = await Models.User.findOne({
//     where: { id: user.id },
//     attributes: ["leaves"],
//   });

//   return res.status(200).json({
//     status: "success",
//     message: "user leave details Fetched successfully",
//     data: {
//       remainingLeaves: userLeaves.leaves,
//       approvedLeaves: totalLeaves ? totalLeaves.totalLeaves : 0,
//       totalLeaves:
//         parseInt(userLeaves.leaves) +
//         parseInt(totalLeaves ? totalLeaves.totalLeaves : 0),
//     },
//   });
// });

// module.exports.getTeamAbsents = CatchAsync(async (req, res, next) => {
//   const { user } = req;

//   let projects = await getUserProjects(user.id);
//   projects = projects.map((project) => {
//     return project.id;
//   });

//   let date = moment(new Date()).format("YYYY-MM-DD");

//   let teamMembers = await Models.ProjectEmployee.findAll({
//     where: { projectId: { [Op.in]: projects } },
//     include: [
//       {
//         model: Models.User,
//         attributes: ["id", "name", "email", "profilePhoto"],
//         include: [
//           {
//             required: false,
//             model: Models.Attendance,
//             where: { [Op.and]: [where(fn("date", col("day")), "=", date)] },
//           },
//         ],
//       },
//     ],
//   });
//   let absentTeamMembers = [];

//   teamMembers.forEach((teamMember) => {
//     const { user: teamUser } = teamMember;
//     if (teamUser.id === user.id) return;
//     let isAlreadyPresent = absentTeamMembers.find(
//       (item) => item.id === teamUser.id
//     );
//     if (teamMember.user.attendances.length === 0 && !isAlreadyPresent)
//       return absentTeamMembers.push(teamUser);
//   });
//   return res.status(200).json({
//     status: "success",
//     message: "user leave details Fetched successfully",
//     data: {
//       absentTeamMembers,
//     },
//   });
// });

// const getUserProjects = async (id) => {
//   let projects = await Models.Project.findAll({
//     where: { deleted: false, progress: { [Op.ne]: "100" } },
//     include: [{ model: Models.ProjectEmployee, where: { employeeId: id } }],
//   });

//   return projects;
// };

// const getWeekDaysTime = (attendanceSummary) => {
//   let weekStart = moment().startOf("isoWeek").add(0, "day");
//   let given = moment(weekStart, "YYYY-MM-DD");
//   let current = moment().startOf("day");
//   let days = moment.duration(current.diff(given)).asDays();

//   let weekEnd = moment()
//     .startOf("isoWeek")
//     .add(days - 1, "day");

//   let weekDates = [];
//   let startDate = weekStart;
//   let endDate = weekEnd.add(1, "days");
//   while (startDate.format("YYYY-MM-DD") !== endDate.format("YYYY-MM-DD")) {
//     weekDates.push(startDate.format("YYYY-MM-DD"));
//     startDate = startDate.add(1, "days");
//   }

//   let weektimes = [];

//   weekDates.map((thisDate) => {
//     var result = attendanceSummary.find((item) => item.date === thisDate);
//     weektimes.push({
//       date: thisDate,
//       day: moment(thisDate).format("dddd"),
//       hours: result ? result.time.productionHours : 0,
//       punchIn: result ? result.punchIn : "--:--",
//     });
//   });

//   return weektimes;
// };
