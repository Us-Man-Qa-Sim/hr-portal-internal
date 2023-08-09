const { Op, where, fn, col, literal } = require("sequelize");
const urlencode = require("urlencode");
const Models = require("../models");
const AppError = require("../utils/AppError");
const CatchAsync = require("../utils/CatchAsync");
const Helpers = require("../utils/Helpers");
const Service = require("../Services/User.Service");
let moment = require("moment");
const fs = require('fs')
const { email } = require("../email/sendPaySlip");
const momentBusiness = require("moment-business-days");

const Paginate = require("../utils/Paginate");
const {
  roles,
  roleIds,
  leaveStatusIds,
  designationIds,
  jobStatus,
} = require("../configs/Constants");

module.exports.getUsers = CatchAsync(async (req, res, next) => {
  const { user, query } = req;
  let searchByName = undefined;
  if (query?.name)
    searchByName = where(
      fn("LOWER", col("name")),
      "LIKE",
      `%${urlencode.decode(query.name)?.toLowerCase()}%`
    );

  let whereClause = {
    deleted: false,
    roleId: query?.roleId ? query?.roleId : roleIds[1],
    designationId: query?.designationId ? query?.designationId : undefined,
    name: searchByName,
    id: { [Op.not]: user?.id },
  };

  Object.keys(whereClause).forEach((item) => {
    if (whereClause[item] === undefined) delete whereClause[item];
  });

  const pagination = await Paginate(
    Models.User,
    whereClause,
    query.page,
    query.limit
  );

  let users = await Models.User.findAll({
    attributes: [
      "id",
      "name",
      "email",
      "jobStatus",
      "joiningDate",
      "profilePhoto",
      "contactNumber",
    ],

    where: whereClause,
    include: [
      { model: Models.Role, attributes: ["id", "title"] },
      {
        model: Models.Designation,
        attributes: ["id", "title"],
      },
    ],
    order: [["createdAt", "desc"]],
    limit: pagination.limit,
    offset: pagination.offset,
  });

  users = Helpers.convertToPlainJSObject(users);

  return res.status(200).json({
    status: "success",
    message: "All Users are Fetched",
    data: {
      pagination,
      users,
    },
  });
});

module.exports.addUser = CatchAsync(async (req, res, next) => {
  const { data } = req.body;

  let user = await Models.User.findOne({ where: { email: data?.email } });
  if (user) return next(new AppError("Email already Exists", 400));

  const checkClient = await Models.Role.findOne({
    where: { id: data.roleId, title: roles.CLIENT },
  });

  if (!(data.roleId == roleIds[1])) {
    data["jobStatus"] = "Permanent";
  }

  if (checkClient) data["isClient"] = true;

  user = await Models.User.create({ ...data });

  user = Helpers.convertToPlainJSObject(user);
  user = Helpers.removePassword(user);
  user = Helpers.removeDelete(user);

  return res.status(200).json({
    status: "success",
    message: "User added successfully",
    data: {
      id: user.id,
      name: user.name,
      email: user.email,
      roleId: user.roleId,
    },
  });
});

module.exports.updateUser = CatchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { data } = req.body;

  let oldData = await Models.User.findOne({ where: { id } });

  if (
    oldData.jobStatus === jobStatus.PERMANENT &&
    data.jobStatus === jobStatus.PROBATION
  )
    return next(
      new AppError(
        "You can not change job status to probation form permanent",
        400
      )
    );

  if (
    oldData.jobStatus === jobStatus.PROBATION &&
    data.jobStatus === jobStatus.PERMANENT
  ) {
    let today = parseInt(new Date().getDate());
    data["leaves"] = today <= 5 ? 2 : today <= 15 ? 1 : 0;
  }

  if (!data.password) delete data.password;

  const checkUserInDB = await Models.User.findOne({ where: { id } });
  if (!checkUserInDB)
    return next(new AppError("Invalid ID. User not found", 404));

  let [, [user]] = await Models.User.update(
    { ...data },
    { where: { id }, returning: true, individualHooks: true }
  );

  user = Helpers.convertToPlainJSObject(user);
  user = Helpers.removePassword(user);

  return res.status(200).json({
    status: "success",
    message: "User updated successfully",
    data: {
      user,
    },
  });
});

module.exports.softDeleteUser = CatchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { user } = req;

  if (id === user.id) return next(new AppError("User cannot delete itself"));

  const checkUserInDB = await Models.User.findOne({
    where: { id, deleted: false },
  });
  if (!checkUserInDB)
    return next(new AppError("Invalid ID. User not found", 404));

  let [, []] = await Models.User.update(
    { deleted: true },
    { where: { id }, returning: true }
  );

  let employeeTasks = await Models.Task.findAll({
    where: { employeeId: id },
  });

  await Models.ProjectEmployee.destroy({ where: { employeeId: id } });

  employeeTasks.forEach(async (task) => {
    await Models.Comment.create({
      taskId: task.id,
      userId: user.id,
      text: `This employee is not more working in company`,
      isLog: true,
    });

    await Models.Task.update(
      { employeeId: null },
      { where: { id: task.id }, returning: true }
    );

  });

  return res.status(200).json({
    status: "success",
    message: "User deleted (Softly) successfully",
    data: {
      userId: id,
    },
  });
});

module.exports.deleteUser = CatchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { user } = req;

  if (id === user.id) return next(new AppError("User cannot delete itself"));

  const checkUserInDB = await Models.User.findOne({
    where: { id, deleted: true },
  });
  if (!checkUserInDB)
    return next(new AppError("Invalid ID. User not found", 404));

  await Models.User.destroy({ where: { id, deleted: true } });
  return res.status(200).json({
    status: "success",
    message: "User deleted successfully",
    data: {
      userId: id,
    },
  });
});

module.exports.login = CatchAsync(async (req, res, next) => {
  const { email, password } = req.body.data;

  let user = await Models.User.findOne({ where: { email, deleted: false } });

  if (!user) return next(new AppError("Email or password is incorrect", 400));

  const validPassword = await user.validatePassword(password);

  if (!validPassword)
    return next(new AppError(`Email or password is incorrect`, 400));

  const token = Helpers.generateToken({
    id: user.id,
    role: user.role,
    name: user.name,
    roleId: user.roleId,
    designationId: user.designationId,
    isClient: user.isClient,
  });

  let permissions = await Models.Permission.findAll({
    where: {
      designationId: user.designationId,
      roleId: user.roleId,
    },
    include: [{ model: Models.Module, attributes: ["title", "id"] }],
    attributes: ["read", "write", "update", "delete", "self"],
  });

  permissions = permissions.map((item) => {
    return Helpers.convertToPlainJSObject(item);
  });

  user = Helpers.convertToPlainJSObject(user);
  user = Helpers.removePassword(user);

  return res.status(200).json({
    status: "success",
    message: "You are successfully logged in.",
    data: {
      token,
      user,
      permissions,
    },
  });
});

module.exports.logout = CatchAsync(async (req, res, next) => {
  return res.status(200).json({
    status: "success",
    message: "You are successfully logged out.",
  });
});

module.exports.addProfilePhoto = CatchAsync(async (req, res, next) => {
  const { id } = req.params;
  const file = req.files[0];
  const profilePhotoUrl = `${process.env.URL}${file.path}`;
  const checkUserInDB = await Models.User.findOne({ where: { id } });
  if (!checkUserInDB)
    return next(new AppError("Invalid ID. User not found", 404));

  let [, [user]] = await Models.User.update(
    {
      profilePhoto: profilePhotoUrl,
    },
    { where: { id }, returning: true }
  );

  user = Helpers.convertToPlainJSObject(user);
  user = Helpers.removePassword(user);

  return res.status(200).json({
    status: "success",
    message: "Profile photo added successfully.",
    data: {
      userId: id,
    },
  });
});

module.exports.getLeaveApplications = CatchAsync(async (req, res, next) => {
  const { user, query } = req;

  let whereClause = {};

  if (user.roleId !== roleIds[0]) {
    whereClause["employeeId"] = user?.id;
  }

  const pagination = await Paginate(
    Models.LeaveApplication,
    whereClause,
    query.page,
    query.limit
  );

  let leaveApplications = await Models.LeaveApplication.findAll({
    attributes: { exclude: ["employeeId", "approvedBy"] },
    where: whereClause,
    include: [
      {
        model: Models.User,
        attributes: [["id", "employeeId"], "name", "profilePhoto", "leaves"],
      },
      {
        model: Models.LeaveApplicationStatus,
        attributes: ["id", "title", "color"],
      },
      {
        model: Models.User,
        as: "acceptedBy",
        attributes: [["id", "employeeId"], "name", "profilePhoto"],
      },
    ],
    order: [["createdAt", "DESC"]],
    limit: pagination.limit,
    offset: pagination.offset,
  });

  leaveApplications = Helpers.convertToPlainJSObject(leaveApplications);

  let data = {
    leaveApplications,
    pagination,
  };

  if (user.roleId === roleIds[0]) {
    let adminLeaveData = await Service.calculateAdminLeaveData();
    let leaves = leaveApplications.map((leave) => {
      let to = moment(leave.to).format("YYYY-MM-DD");
      leave["disabled"] = moment(to).isBefore(moment(new Date()), "day");
      return leave;
    });

    data["leaveApplications"] = leaves;
    data["adminLeaveData"] = adminLeaveData;
  } else {
    let employeeLeaveData = await Service.calculateEmployeeLeaveData(user.id, leaveApplications);
    data["employeeLeaveData"] = employeeLeaveData;
  }


  if (query.year) {
    let startDate = moment(new Date(`${query.year}-07-01`)).format("YYYY-MM-DD");
    let endDate = moment(startDate).add(11, 'months').endOf('month').format('YYYY-MM-DD')
    data['leaveApplications'] = Service.returnInDateLeaves(startDate, endDate, leaveApplications)

  }

  return res.status(200).json({
    status: "success",
    message: "Leaves are successfully fetched.",
    data,
  });
});

module.exports.applyForLeaves = CatchAsync(async (req, res, next) => {
  const {
    user,
    body: { data },
  } = req;
  let leaveApplication;
  var from = moment(data.from, "YYYY-MM-DD");
  var to = moment(data.to, "YYYY-MM-DD");

  //Difference in number of days

  let dayAfter = moment(to).add(1, "days");

  let check = (diff = momentBusiness(dayAfter, "YYYY-MM-DD").businessDiff(
    momentBusiness(from, "YYYY-MM-DD"),
    true
  ));

  let remainingLeaves = await Models.User.findOne({
    where: { id: user.id },
    attributes: ["leaves"],
  });

  remainingLeaves = parseInt(remainingLeaves.leaves);

  if (parseInt(check) > remainingLeaves)
    return next(
      new AppError("Your remaining leaves are less than requested leaves", 400)
    );

  const info = {
    from: data.from,
    to: data.to,
    leaveType: data.leaveType,
    reason: data.reason,
    noOfDays: check,
    employeeId: user.id,
  };

  leaveApplication = await Models.LeaveApplication.create({ ...info });

  leaveApplication = Helpers.convertToPlainJSObject(leaveApplication);

  let admin = await Models.User.findOne({
    where: { roleId: roleIds[0] },
  });

  await email({
    to: admin.email,
    subject: `Time Off Request of ${user.name} from ${moment(
      leaveApplication.from
    ).format("DD MMMM")} for ${leaveApplication.noOfDays} day`,
    html: `${leaveApplication.reason}`,
    attachments: null,
  });

  return res.status(200).json({
    status: "success",
    message: "You have successfully applied for leaves.",
    data: {
      leaveApplication,
    },
  });
});

module.exports.updateLeave = CatchAsync(async (req, res, next) => {
  const { leaveId } = req.params;
  const { data } = req.body;

  let leaveApplication = await Models.LeaveApplication.findOne({
    where: {
      id: leaveId,
    },
  });
  if (!leaveApplication)
    return next(new AppError("Leave not found. Invalid ID", 400));

  var from = moment(data.from, "YYYY-MM-DD");
  var to = moment(data.to, "YYYY-MM-DD");

  let dayAfter = moment(to).add(1, "days");

  let check = (diff = momentBusiness(dayAfter, "YYYY-MM-DD").businessDiff(
    momentBusiness(from, "YYYY-MM-DD"),
    true
  ));

  data["noOfDays"] = check;

  if (check !== parseInt(leaveApplication.noOfDays)) {
    data["leavestatus"] = leaveStatusIds.Pending;

    if (leaveApplication.leavestatus === leaveApplication.Approved)
      await Models.User.update(
        {
          leaves: literal(`leaves + ${leaveApplication.noOfDays}`),
        },
        {
          where: { id: leaveApplication.employeeId },
          returning: true,
        }
      );
  }

  if (!data || Object.keys(data).length === 0)
    return res.status(404).json({
      status: "fail",
      message: "no data in body to update the leave application",
    });

  [, [leaveApplication]] = await Models.LeaveApplication.update(
    { ...data },
    { where: { id: leaveId }, returning: true }
  );

  leaveApplication = Helpers.convertToPlainJSObject(leaveApplication);

  return res.status(200).json({
    status: "success",
    message: "Leave application successfully updated.",
    data: {
      leaveApplication,
    },
  });
});

module.exports.changeLeaveStatus = CatchAsync(async (req, res, next) => {
  const { leaveId } = req.params;
  const { user } = req;
  const { status } = req.body.data;

  let leaveApplication = await Models.LeaveApplication.findOne({
    where: {
      id: leaveId,
    },
  });

  let oldStatus = leaveApplication.leavestatus;

  if (!leaveApplication)
    return next(new AppError("Leave not found. Invalid ID", 400));

  [, [leaveApplication]] = await Models.LeaveApplication.update(
    {
      leavestatus: leaveStatusIds[status],
      approvedBy:
        leaveStatusIds[status] === leaveStatusIds.Approved ? user.id : null,
    },
    { where: { id: leaveId }, returning: true }
  );
  leaveApplication = Helpers.convertToPlainJSObject(leaveApplication);

  if (leaveStatusIds[status] === leaveStatusIds.Approved)
    await Models.User.update(
      {
        leaves: literal(`leaves - ${leaveApplication.noOfDays}`),
      },
      {
        where: { id: leaveApplication.employeeId },
        returning: true,
      }
    );

  if (
    oldStatus === leaveStatusIds.Approved &&
    leaveStatusIds[status] !== leaveStatusIds.Approved
  )
    await Models.User.update(
      {
        leaves: literal(`leaves + ${leaveApplication.noOfDays}`),
      },
      {
        where: { id: leaveApplication.employeeId },
        returning: true,
      }
    );

  if (
    leaveStatusIds[status] === leaveStatusIds.Approved ||
    leaveStatusIds[status] === leaveStatusIds.Declined
  ) {
    let user = await Models.User.findOne({
      where: { id: leaveApplication.employeeId },
    });
    await email({
      to: user.email,
      subject: `Leave Request ${moment(leaveApplication.from).format(
        "DD MMMM"
      )}`,
      html: `Dear <b>${user.name}</b>, <br><br> Your Leave request has been ${status} <br><br><br> Thank You`,
      attachments: null,
    });
  }

  return res.status(200).json({
    status: "success",
    message: "Leave application Status changed.",
    data: {
      leaveApplication,
    },
  });
});

module.exports.deleteLeave = CatchAsync(async (req, res, next) => {
  const { leaveId } = req.params;
  const { user } = req;
  let leaveApplication = await Models.LeaveApplication.findOne({
    where: {
      id: leaveId,
    },
  });
  if (!leaveApplication)
    return next(new AppError("Leave not found. Invalid ID", 400));

  if (
    user.roleId === roleIds[1] &&
    leaveApplication.leavestatus === leaveStatusIds.Approved
  )
    return next(
      new AppError("you can not delete your approved Leave Application", 400)
    );

  await Models.LeaveApplication.destroy({
    where: {
      id: leaveId,
    },
  });
  return res.status(200).json({
    status: "success",
    message: "Leave application is deleted.",
    id: leaveId,
  });
});

module.exports.userInfo = CatchAsync(async (req, res, next) => {
  const { id } = req.params;

  let user = await Models.User.findOne({
    where: { id },
    attributes: {
      exclude: [
        "roleId",
        "designationId",
        "password",
        "createdAt",
        "updatedAt",
        "deviceToken",
      ],
    },
    include: [
      { model: Models.Role, attributes: ["id", "title"] },
      {
        model: Models.Designation,
        attributes: ["id", "title"],
      },
      {
        model: Models.Experience,
      },
      {
        model: Models.Education,
      },
      {
        model: Models.EmergencyContact,
      },
    ],
  });
  res.send(user);
});

module.exports.addCnicPhotos = CatchAsync(async (req, res, next) => {
  const files = req.files;
  const { id } = req.params;
  let cnicFrontPhotoUrl;
  let cnicBackPhotoUrl;
  const checkUserInDB = await Models.User.findOne({ where: { id } });
  if (!checkUserInDB)
    return next(new AppError("Invalid ID. User not found", 404));

  if (files.length > 1) {
    cnicFrontPhotoUrl = `${process.env.URL}${files[0].path}`
    cnicBackPhotoUrl = `${process.env.URL}${files[1].path}`
  } else {
    cnicFrontPhotoUrl = files[0].path;
  }
  let [, [user]] = await Models.User.update(
    {
      cnicFrontPhoto: cnicFrontPhotoUrl ? cnicFrontPhotoUrl : null,
      cnicBackPhoto: cnicBackPhotoUrl ? cnicBackPhotoUrl : null,
    },
    { where: { id }, returning: true }
  );
  return res.status(200).json({
    status: "success",
    message: "CNIC Photos Added Successfully.",
    data: {
      userId: id,
    },
  });
});

module.exports.getUserProjects = CatchAsync(async (req, res, next) => {
  const { id } = req.params;

  const checkUserInDB = await Models.User.findOne({ where: { id } });
  if (!checkUserInDB)
    return next(new AppError("Invalid ID. User not found", 404));

  let projects = await Models.ProjectEmployee.findAll({
    where: {
      employeeId: id,
    },
    attributes: ["projectId"],
  });

  projects = Helpers.convertToPlainJSObject(projects);
  let projectList = [];

  projects?.map((data) => projectList.push(data.projectId));

  let userProjects = await Models.Project.findAll({
    attributes: {
      exclude: [
        "clientId",
        "deleted",
        "departmentId",
        "createdAt",
        "updatedAt",
        "status",
        "createdBy",
      ],
    },
    where: {
      deleted: false,
      id: { [Op.in]: projectList },
    },

    include: [
      {
        model: Models.User,
        as: "client",
        attributes: [["id", "clientId"], "name", "email"],
      },
      { model: Models.ProjectStatus, attributes: ["id", "title", "color"] },
      {
        model: Models.User,
        as: "projectCreator",
        attributes: ["id", "name", "email"],
        include: [{ model: Models.Role }, { model: Models.Designation }],
      },
      { model: Models.Department },
      {
        model: Models.ProjectEmployee,
        required: false,
        include: {
          model: Models.User,
          attributes: [["id", "employeeId"], "name", "email", "profilePhoto"],
        },
      },
    ],
  });

  return res.status(200).json({
    status: "success",
    message: "user projects are successfully fetched out.",
    data: {
      userProjects,
    },
  });
});

module.exports.getClientProjects = CatchAsync(async (req, res, next) => {
  const { id } = req.params;

  const checkUserInDB = await Models.User.findOne({
    where: { id, isClient: true, deleted: false },
  });
  if (!checkUserInDB)
    return next(
      new AppError("Invalid ID. User not found or user is not client", 404)
    );

  let clientProjects = await Models.Project.findAll({
    attributes: {
      exclude: [
        "deleted",
        "departmentId",
        "createdAt",
        "updatedAt",
        "status",
        "createdBy",
      ],
    },
    where: {
      deleted: false,
      clientId: id,
    },

    include: [
      {
        model: Models.User,
        as: "client",
        attributes: [["id", "clientId"], "name", "email"],
      },
      { model: Models.ProjectStatus, attributes: ["id", "title", "color"] },
      {
        model: Models.User,
        as: "projectCreator",
        attributes: ["id", "name", "email"],
        include: [{ model: Models.Role }, { model: Models.Designation }],
      },
      { model: Models.Department },
      {
        model: Models.ProjectEmployee,
        required: false,
        include: {
          model: Models.User,
          attributes: [["id", "employeeId"], "name", "email", "profilePhoto"],
        },
      },
    ],
  });

  return res.status(200).json({
    status: "success",
    message: "Client projects are fetched successfully",
    data: {
      clientProjects,
    },
  });
});

module.exports.getLeads = CatchAsync(async (req, res, next) => {
  let whereClause = {
    roleId: roleIds[1],
    designationId: designationIds.teamLead,
    deleted: false,
  };

  let leads = await Models.User.findAll({
    where: whereClause,
    attributes: [
      "id",
      "name",
      "email",
      "createdAt",
      "profilePhoto",
      "contactNumber",
    ],
    include: [
      {
        model: Models.ProjectEmployee,
        attributes: ["id", "projectId", "employeeId", "isLead"],
        include: {
          model: Models.Project,
          attributes: ["id", "title", "progress"],
        },
      },
    ],

    order: [["createdAt", "desc"]],
  });

  let leadsData = [];

  leads.map((data) => {
    if (data.projectEmployees.length === 0)
      leadsData.push({
        id: data.id,
        name: data.name,
        email: data.email,
        contactNumber: data.contactNumber,
        profilePhoto: data.profilePhoto,
        Project: {},
      });
    data.projectEmployees.map((item) => {
      leadsData.push({
        id: data.id,
        name: data.name,
        email: data.email,
        contactNumber: data.contactNumber,
        profilePhoto: data.profilePhoto,
        ProjectData: Helpers.convertToPlainJSObject(item.project),
      });
    });
  });

  return res.status(200).json({
    status: "success",
    message: "Leads are successfully fetched",
    data: {
      leadsData,
    },
  });
});

module.exports.leaveSetting = CatchAsync(async (req, res, next) => {
  let setting = await Models.LeaveSetting.findOne();
  const { annual, casual, medical, leaveEncashment, carryForword } =
    req.body.data;
  if (!setting) {
    let leaveSetting = await Models.LeaveSetting.create({
      annual,
      casual,
      medical,
      leaveEncashment: leaveEncashment !== undefined ? leaveEncashment : true,
      carryForword: carryForword !== undefined ? carryForword : false,
    });

    leaveSetting = Helpers.convertToPlainJSObject(leaveSetting);

    return res.status(200).json({
      status: "success",
      message: "Leave Settings are successfully added",
      data: {
        leaveSetting,
      },
    });
  } else {
    let [, [leaveSetting]] = await Models.LeaveSetting.update(
      {
        annual,
        casual,
        medical,
        leaveEncashment: leaveEncashment !== undefined ? leaveEncashment : true,
        carryForword: carryForword !== undefined ? carryForword : false,
      },
      { where: { id: setting.id }, returning: true }
    );

    return res.status(200).json({
      status: "success",
      message: "Leave Settings are successfully updated",
      data: {
        leaveSetting,
      },
    });
  }
});

module.exports.getRemainingLeave = CatchAsync(async (req, res, next) => {
  const { id } = req.params;

  let leaves = await Models.User.findOne({
    where: { id },
    attributes: ["leaves"],
  });

  leaves = Helpers.convertToPlainJSObject(leaves);

  return res.status(200).json({
    status: "success",
    message: "user remaining leaves are successfully fetched",
    data: {
      leaves,
    },
  });
});

module.exports.getLeaveSetting = CatchAsync(async (req, res, next) => {
  let leaveSetting = await Models.LeaveSetting.findOne();

  leaveSetting = Helpers.convertToPlainJSObject(leaveSetting);

  return res.status(200).json({
    status: "success",
    message: "Leave Settings are successfully fetched",
    data: {
      leaveSetting,
    },
  });
});

module.exports.deleteLeaveSetting = CatchAsync(async (req, res, next) => {
  await Models.LeaveSetting.destroy({ where: {} });

  return res.status(200).json({
    status: "success",
    message: "Leave Settings are successfully deleted",
  });
});

module.exports.returnDocument = (req, res, next) => {

  const url = req.params
  let fileName = url[0]

  if (!fs.existsSync(fileName)) return next(
    new AppError("Error: No such file or directory", 404)
  );

  var stat = fs.statSync(`${fileName}`);
  res.setHeader("Content-Length", stat.size);
  let fileType = fileName.split('.')[1]
  var data = fs.readFileSync(`${fileName}`);
  res.contentType(`application/${fileType}`);

  return res.send(data)

}