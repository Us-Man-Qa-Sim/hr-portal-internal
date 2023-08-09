const { Op, where, fn, col } = require("sequelize");
const Models = require("../models");
const AppError = require("../utils/AppError");
const CatchAsync = require("../utils/CatchAsync");
const Helpers = require("../utils/Helpers");
const Services = require("../Services/Project.service");
const Paginate = require("../utils/Paginate");
const urlencode = require("urlencode");

const {
  roleIds,
  designationIds,
  projectStatusIds,
} = require("../configs/Constants");

module.exports.getProjects = CatchAsync(async (req, res, next) => {
  const { query, user } = req;
  let searchByProjectName = undefined;

  if (query?.projectName)
    searchByProjectName = where(
      fn("LOWER", col("title")),
      "LIKE",
      `%${urlencode.decode(query.projectName)?.toLowerCase()}%`
    );
  let whereClause = await Services.projectWhereClause(user);

  if (query.statusId) whereClause['status'] = query.statusId
  if (query.projectName) whereClause['title'] = searchByProjectName
  if (query.departmentId) whereClause['departmentId'] = query.departmentId



  console.log(whereClause)
  let pagination = await Paginate(
    Models.Project,
    whereClause,
    query.page,
    query.limit
  );
  let projects = await Models.Project.findAll({
    attributes: {
      exclude: [
        "deleted",
        "departmentId",
        "createdAt",
        "updatedAt",
        "createdBy",
      ],
    },
    where: whereClause,

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
        include: [
          {
            model: Models.Role,
            attributes: ["title"],
          },

          {
            model: Models.Designation,
            attributes: ["title"],
          },
        ],
      },
      {
        model: Models.Department,
        attributes: [["id", "departmentId"], "title"],
      },
      {
        model: Models.Task,
        attributes: ["id", "title"],
        where: { deleted: false },
        required: false,
        include: [
          {
            model: Models.Status,
            attributes: ["title"],
          },
        ],
      },
      {
        model: Models.ProjectEmployee,
        attributes: ["id", "isLead"],
        required: false,
        include: {
          model: Models.User,
          attributes: [["id", "employeeId"], "name", "email", "profilePhoto"],
        },
      },
    ],
    limit: pagination.limit,
    offset: pagination.offset,
  });

  projects = Helpers.convertToPlainJSObject(projects);
  pagination = Services.updatePagination(pagination, projects);

  res.status(200).json({
    status: "Success",
    message: "Projects fetched successfully",
    data: {
      pagination,
      projects,
    },
  });
});

module.exports.getProject = CatchAsync(async (req, res, next) => {
  const { projectId } = req.params;

  const checkProjectInDB = await Models.Project.findOne({
    where: { id: projectId },
  });
  if (!checkProjectInDB)
    return next(new AppError("Project not found or incorrect Project ID", 400));

  let project = await Models.Project.findOne({
    attributes: {
      exclude: [
        "clientId",
        "deleted",
        "createdAt",
        "updatedAt",
        "departmentId",
        "createdBy",
        "status",
      ],
    },
    where: { id: projectId },
    include: [
      {
        model: Models.User,
        as: "projectCreator",
        attributes: ["id", "name", "email"],
        include: [
          {
            model: Models.Role,
            attributes: ["title"],
          },

          {
            model: Models.Designation,
            attributes: ["title"],
          },
        ],
      },
      { model: Models.ProjectStatus },
      { model: Models.Department },
      { model: Models.Task },
      {
        model: Models.User,
        as: "client",
        attributes: [["id", "clientId"], "name", "email"],
      },
      {
        model: Models.ProjectEmployee,
        attributes: ["id", "isLead"],
        include: {
          model: Models.User,
          required: true,
          attributes: [["id", "employeeId"], "name", "email", "profilePhoto"],
          include: [
            {
              model: Models.Designation,
              attributes: ["id", "title"],
            },
          ],
        },
      },
      {
        model: Models.ProjectDocument,
        attributes: [
          "documentURL",
          "projectId",
          "isImage",
          "date",
          "name",
          "type",
          "size",
          "id",
        ],
        include: {
          model: Models.User,
          attributes: ["id", "name", "email", "profilePhoto"],
        },
      },
    ],
  });

  project = Helpers.convertToPlainJSObject(project);

  res.status(200).json({
    status: "Success",
    message: "Project fetched successfully",
    data: { project },
  });
});

module.exports.addProject = CatchAsync(async (req, res, next) => {
  const { user } = req;
  const { data } = req.body;
  data["status"] = projectStatusIds.Pending;
  let project = await Models.Project.create({ ...data });

  project = Helpers.convertToPlainJSObject(project);

  project && user.designationId === designationIds.teamLead && (
    await Models.ProjectEmployee.create({
      projectId: project.id,
      employeeId: user.id,
      isLead: true
    })
  )

  res.status(200).json({
    status: "Success",
    message: "Project created successfully",
    data: {
      project,
    },
  });
});

module.exports.deleteProject = CatchAsync(async (req, res, next) => {
  const { id } = req.params;

  const checkRoleInDB = await Models.Project.findOne({ where: { id } });
  if (!checkRoleInDB)
    return next(new AppError("Invalid ID. Project not found", 404));

  let [, [project]] = await Models.Project.update(
    { deleted: true },
    { where: { id }, returning: true }
  );
  return res.status(200).json({
    status: "success",
    message: "Project deleted successfully",
  });
});

module.exports.updateProject = CatchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { data } = req.body;

  const checkProjectInDB = await Models.Project.findOne({ where: { id } });
  if (!checkProjectInDB)
    return next(new AppError("Invalid ID. Project not found", 404));

  let [, [project]] = await Models.Project.update(
    { ...data },
    { where: { id }, returning: true }
  );

  project = Helpers.convertToPlainJSObject(project);

  return res.status(200).json({
    status: "success",
    message: "Project updated successfully",
    data: {
      id,
    },
  });
});

module.exports.getUnassignedEmployees = CatchAsync(async (req, res, next) => {
  const { projectId } = req.params;

  const checkProjectInDB = await Models.Project.findOne({
    where: { id: projectId, deleted: false },
  });
  if (!checkProjectInDB)
    return next(new AppError("Project not found or incorrect Project ID", 400));

  let employees = await Models.ProjectEmployee.findAll({
    where: { projectId: projectId },
    attributes: ["employeeId"],
  });

  let users = [];

  if (employees) {
    employees.map((employee) => {
      users.push(employee.employeeId);
    });
  }

  let usersList = await Models.User.findAll({
    where: {
      id: { [Op.notIn]: users },
      deleted: false,
      roleId: roleIds[1],
      designationId: {
        [Op.ne]: designationIds.teamLead,
      },
    },
    include: [{ model: Models.Designation, attributes: ["title", "id"] }],
    attributes: ["id", "name", "email", "profilePhoto"],
  });

  return res.status(200).json({
    status: "success",
    message: "Project Unassigned Employees fetched successfully",
    data: {
      usersList,
    },
  });
});

module.exports.getUnassignedLeads = CatchAsync(async (req, res, next) => {
  const { projectId } = req.params;

  const checkProjectInDB = await Models.Project.findOne({
    where: { id: projectId, deleted: false },
  });
  if (!checkProjectInDB)
    return next(new AppError("Project not found or incorrect Project ID", 400));

  let employees = await Models.ProjectEmployee.findAll({
    where: { projectId: projectId, isLead: true },
    attributes: ["employeeId"],
  });

  let users = [];

  if (employees) {
    employees.map((employee) => {
      users.push(employee.employeeId);
    });
  }

  let designationIds = await Models.Designation.findAll({
    where: { canLead: true },
  });

  designationIds = designationIds.map((designation) => {
    return designation.id;
  });

  let usersList = await Models.User.findAll({
    where: {
      id: { [Op.notIn]: users },
      deleted: false,
      roleId: roleIds[1],
      designationId: { [Op.in]: designationIds },
    },
    include: [{ model: Models.Designation, attributes: ["title", "id"] }],
    attributes: ["id", "name", "email", "profilePhoto"],
  });
  return res.status(200).json({
    status: "success",
    message: "Project Unassigned Leads fetched successfully",
    data: {
      usersList,
    },
  });
});

module.exports.getClients = CatchAsync(async (req, res, next) => {
  let clients = await Models.User.findAll({
    where: {
      roleId: roleIds[2],
      isClient: true,
      deleted: false,
    },
    attributes: [
      "id",
      "name",
      "email",
      "profilePhoto",
      "company",
      "clientRole",
    ],
  });
  clients = Helpers.convertToPlainJSObject(clients);

  res.status(200).json({
    status: "Success",
    message: "Clients fetched successfully",
    data: {
      clients,
    },
  });
});

module.exports.searchProjects = CatchAsync(async (req, res, next) => {
  let searchByProjectName = undefined;
  let searchByEmployeeName = undefined;
  const { query } = req;
  if (query?.projectName)
    searchByProjectName = where(
      fn("LOWER", col("title")),
      "LIKE",
      `%${query?.projectName?.toLowerCase()}%`
    );
  if (query?.employeeName)
    searchByEmployeeName = where(
      fn("LOWER", col("name")),
      "LIKE",
      `%${query?.employeeName?.toLowerCase()}%`
    );

  let whereClause = {
    deleted: false,
    departmentId: query?.departmentId ? query?.departmentId : undefined,
    title: searchByProjectName,
  };
  let employeeWhereCaluse = {};
  if (searchByEmployeeName)
    employeeWhereCaluse = {
      name: searchByEmployeeName,
    };

  Object.keys(whereClause).forEach((item) => {
    if (whereClause[item] === undefined) delete whereClause[item];
  });

  Object.keys(employeeWhereCaluse).forEach((item) => {
    if (employeeWhereCaluse[item] === undefined)
      delete employeeWhereCaluse[item];
  });

  let projects = await Models.Project.findAll({
    attributes: ["id", "title", "description", "deadline"],

    where: whereClause,

    include: [
      {
        model: Models.ProjectEmployee,
        attributes: ["id", "isLead"],
        required: query?.employeeName ? true : false,
        include: {
          model: Models.User,
          //required: true,
          attributes: [["id", "employeeId"], "name", "email", "profilePhoto"],
          where: employeeWhereCaluse,
        },
      },
    ],
  });

  projects = Helpers.convertToPlainJSObject(projects);

  res.status(200).json({
    status: "Success",
    message: "Projects fetched successfully",
    data: {
      projects,
    },
  });
});

module.exports.getProjectStatuses = CatchAsync(async (req, res, next) => {
  let projectStatuses = await Models.ProjectStatus.findAll();
  res.status(200).json({
    status: "Success",
    message: "project Statuses fetched successfully",
    data: {
      projectStatuses,
    },
  });
});