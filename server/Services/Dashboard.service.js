const Models = require("../models");
const AppError = require("../utils/AppError");
const Helpers = require("../utils/Helpers");
const Paginate = require("../utils/Paginate");
const { StatusIds, leaveStatusIds, roleIds, projectStatusIds } = require("../configs/Constants");
let { Op, where, fn, col, literal } = require("sequelize");
const moment = require("moment");
const { calculateAttendanceData, getLeavesDates } = require("../Services/Attendance.service");

const getTaskStatistics = async (req, sprintId) => {
  const { user } = req;

  let whereClause = { employeeId: user.id, deleted: false }

  if (sprintId) {
    whereClause = { sprintId, deleted: false }
  }
  console.log('whereClause', whereClause)

  let tasks = await Models.Task.findAll({ where: whereClause });

  let pending = (progress = complete = testing = cancel = 0);
  tasks.forEach((task) => {
    if (task.statusId === StatusIds.Pending) pending += 1;
    if (task.statusId === StatusIds.Progress) progress += 1;
    if (task.statusId === StatusIds.Complete) complete += 1;
    if (task.statusId === StatusIds.Testing) testing += 1;
    if (task.statusId === StatusIds.Cancel) cancel += 1;
  });

  return { total: tasks.length, pending, progress, complete, testing, cancel };
};

const getTasks = async (req) => {
  const { user, query } = req;

  let todayDate = new Date();

  let sprint = await Models.Sprint.findOne({
    where: {
      startDate: {
        [Op.lte]: todayDate,
      },
      endDate: {
        [Op.gte]: todayDate,
      },
    },
  });

  let whereClause = { employeeId: user.id, sprintId: sprint.id, deleted: false };
  const pagination = await Paginate(
    Models.Task,
    whereClause,
    query.page,
    query.limit
  );

  tasks = await Models.Task.findAll({
    where: whereClause,
    include: [{
      model: Models.Status,
      attributes: ["id", "title", "color"],
    }],
    order: [["createdAt", "DESC"]],
    limit: pagination.limit,
    offset: pagination.offset,
  });

  tasks = Helpers.convertToPlainJSObject(tasks);

  return { pagination, tasks };
};

const getTimeSpent = async (req) => {
  const { user } = req;
  let times = await Models.Attendance.findAll({
    where: {
      userId: user.id,
    },
  });
  times = Helpers.convertToPlainJSObject(times);
  times = calculateAttendanceData(times);

  let onTime = 0;

  times.forEach((day) => {
    let punchInTime = moment(
      `${day.date} ${day.punchIn}`,
      "YYYY-MM-DD HH:mm a"
    );
    let requiredTime = moment(`${day.date} 10:00 AM`, "YYYY-MM-DD HH:mm a");
    var before = punchInTime.isBefore(requiredTime);
    if (before) onTime += 1;
  });

  let weekTimes = getWeekDaysTime(times);

  return { onTime, late: times.length - onTime, weekTimes };
};

const coursesAndTrainings = async (req) => {
  return;
};

const getProjects = async (req) => {
  const { user } = req;

  let projects = await getUserProjects(user.id);

  return projects;
};

const getMeetings = async (req) => {
  return {};
};

const getLeaveStatistics = async (req) => {
  const { user } = req;

  const totalLeaves = await Models.LeaveApplication.findOne({
    where: { employeeId: user.id, leavestatus: leaveStatusIds.Approved },
    attributes: ["employeeId", [fn("sum", col("noOfDays")), "totalLeaves"]],
    group: ["employeeId"],
    raw: true,
  });

  const userLeaves = await Models.User.findOne({
    where: { id: user.id },
    attributes: ["leaves"],
  });

  return {
    remainingLeaves: userLeaves.leaves,
    approvedLeaves: totalLeaves ? totalLeaves.totalLeaves : 0,
    totalLeaves:
      parseInt(userLeaves.leaves) +
      parseInt(totalLeaves ? totalLeaves.totalLeaves : 0),
  };
};

const getTeamAbsents = async (req) => {
  const { user } = req;

  let projects = await getUserProjects(user.id);
  projects = projects.map((project) => {
    return project.id;
  });

  let date = moment(new Date()).format("YYYY-MM-DD");

  let teamMembers = await Models.ProjectEmployee.findAll({
    where: { projectId: { [Op.in]: projects } },
    include: [
      {
        model: Models.User,
        attributes: ["id", "name", "email", "profilePhoto"],
        include: [
          {
            required: false,
            model: Models.Attendance,
            where: { [Op.and]: [where(fn("date", col("day")), "=", date)] },
          },
        ],
      },
    ],
  });

  let absentTeamMembers = [];

  teamMembers.forEach((teamMember) => {
    const { user: teamUser } = teamMember;
    if (teamUser.id === user.id) return;
    let isAlreadyPresent = absentTeamMembers.find(
      (item) => item.id === teamUser.id
    );
    if (teamMember.user.attendances.length === 0 && !isAlreadyPresent)
      return absentTeamMembers.push(teamUser);
  });
  return {
    absentTeamMembers,
  };
};

const getUserProjects = async (id) => {
  let projects = await Models.Project.findAll({
    where: { deleted: false, progress: { [Op.ne]: "100" } },
    attributes: [
      "title",
      "id",
      "description",
      "progress",
      "startDate",
      "deadline",
      "status",
    ],
    include: [
      {
        model: Models.ProjectEmployee,
        where: { employeeId: id },
        attributes: ["employeeId", "isLead"],
      },
      { model: Models.ProjectStatus, attributes: ["title", "color"] },
    ],
  });

  return projects;
};

const getWeekDaysTime = (attendanceSummary) => {
  let weekStart = moment().startOf("isoWeek").add(0, "day");
  let given = moment(weekStart, "YYYY-MM-DD");
  let current = moment().startOf("day");
  let days = moment.duration(current.diff(given)).asDays();

  let weekEnd = moment()
    .startOf("isoWeek")
    .add(days - 1, "day");

  let weekDates = [];
  let startDate = weekStart;
  let endDate = weekEnd.add(1, "days");
  while (startDate.format("YYYY-MM-DD") !== endDate.format("YYYY-MM-DD")) {
    weekDates.push(startDate.format("YYYY-MM-DD"));
    startDate = startDate.add(1, "days");
  }

  let weektimes = [];

  weekDates.map((thisDate) => {
    var result = attendanceSummary.find((item) => item.date === thisDate);
    weektimes.push({
      date: thisDate,
      day: moment(thisDate).format("dddd"),
      hours: result ? result.time.productionHours : 0,
      punchIn: result ? result.punchIn : null,
    });
  });

  return weektimes;
};

const getCompanyEmployeeStatistics = async () => {

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
  const endDate = moment(startDate).add(1, 'days')
  let leaveCount = 0

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
        leaveCount += 1
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

const getProjectStatistics = async () => {
  let projects = await Models.Project.findAll({
    where: { deleted: false },
    attributes: [
      "title",
      "id",
      "progress",
      "startDate",
      "deadline",
      "status",
    ],
    include: [
      { model: Models.ProjectStatus, attributes: ["title", "color"] },
    ],
  });

  let pendingProjects = projects.filter((project) => { if (project.status === projectStatusIds.Pending) return project })
  let inProgressProjects = projects.filter((project) => { if (project.status === projectStatusIds.Progress) return project })
  let completeProjects = projects.filter((project) => { if (project.status === projectStatusIds.Complete) return project })
  let supportProjects = projects.filter((project) => { if (project.status === projectStatusIds.Support) return project })
  let cancelProjects = projects.filter((project) => { if (project.status === projectStatusIds.Cancelled) return project })


  return {
    total: projects.length,
    pendingProjects,
    inProgressProjects,
    completeProjects,
    supportProjects,
    cancelProjects,
  };
};

const getInLeadProjects = async (user) => {
  let projects = await Models.Project.findAll({
    where: { deleted: false },
    attributes: ['id', 'title', 'progress', 'startDate', 'deadline'],
    include: [{
      model: Models.ProjectEmployee,
      where: {
        employeeId: user.id, isLead: true
      },
      required: true,
      attributes: ['isLead', 'id',],
    }]
  })
  return projects
}

const getSprintReviewTask = async (projects, sprint) => {
  let sprintReviewTask = await Models.Task.findAll({
    where: {
      deleted: false, sprintId: sprint.id, statusId: StatusIds.Testing,
      projectId: { [Op.in]: projects.map((project) => { return project.id }) }
    },
    attributes: ['title', 'priority'],
    include: [{
      model: Models.User,
      as: "employee",
      attributes: ["name", "profilePhoto"],
    },]
  })

  return sprintReviewTask
}

const getProjectTeamMembers = async (projects, user) => {
  let teamMembers = await Models.ProjectEmployee.findAll({
    where: { projectId: { [Op.in]: projects.map((project) => { return project.id }) } },
    include: [
      {
        model: Models.User,
        attributes: ["id", "name", "email", "profilePhoto"],
      },
      { model: Models.Project, attributes: ['title'] }
    ],
  });

  let projectTeamMembers = [];

  teamMembers = Helpers.convertToPlainJSObject(teamMembers)

  teamMembers.forEach((teamMember) => {
    const { user: teamUser } = teamMember;
    if (teamUser.id === user.id) return;
    teamUser['projectTitle'] = teamMember.project.title
    teamUser['projectId'] = teamMember.projectId
    return projectTeamMembers.push(teamUser);
  });

  return projectTeamMembers
}

const getSprintProgress = async (projects, sprint, query) => {
  let projectId = query?.projectId ? query.projectId : projects[0].id

  let sprintId = query?.sprintId ? query?.sprintId : sprint.id


  let result = projects.find((item) => item.id === projectId);

  result = result ? result : {}

  let sprintProgress = []
  let taskLog = await Models.TaskLog.findAll({ where: { projectId, sprintId } })


  let projectEmployees = taskLog.map((member) => { return member.userId })
  projectEmployees = [...new Set(projectEmployees)]

  if (projectEmployees.length > 0) {

    projectEmployees = await Models.User.findAll({ where: { id: { [Op.in]: projectEmployees } }, attributes: ['id', 'name', 'email'] })

    projectEmployees?.forEach((projectEmployee) => {

      let tasks = taskLog.filter((task) => task.userId === projectEmployee.id)

      let data = {
        userName: projectEmployee.name,
        userEmail: projectEmployee.email,
        total: tasks.length,
        completed: tasks.filter((task) => task.statusId === StatusIds.Complete).length,
        underReview: tasks.filter((task) => task.statusId === StatusIds.Testing).length,
        shifted: tasks.filter((task) => task.shifted === true).length,
        incomplete: tasks.filter((task) => task.statusId === StatusIds.Pending || task.statusId === StatusIds.Progress).length
      }
      sprintProgress.push(data)
    })
  }

  return { project: result, sprintProgress }
}
module.exports = {
  getTaskStatistics,
  getTasks,
  getTimeSpent,
  coursesAndTrainings,
  getProjects,
  getMeetings,
  getLeaveStatistics,
  getTeamAbsents,
  getCompanyEmployeeStatistics,
  getProjectStatistics,
  getInLeadProjects,
  getSprintReviewTask,
  getProjectTeamMembers,
  getSprintProgress
};
