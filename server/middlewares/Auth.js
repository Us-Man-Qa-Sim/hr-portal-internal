const { Op } = require("sequelize");

const AppError = require("../utils/AppError");
const CatchAsync = require("../utils/CatchAsync");
const Helpers = require("../utils/Helpers");
const Models = require("../models");
const { RequestMethods, roleIds } = require("../configs/Constants");

module.exports.Authenticate = CatchAsync(async (req, res, next) => {
  const header = req.headers["authorization"];
  const token = header && header.split(" ")[1];
  if (!token)
    return next(new AppError("Invalid token, Please login again.", 401));

  const decode = Helpers.validateToken(token);
  if (!decode)
    return next(new AppError("Invalid token, Please login again.", 401));

  const user = await Models.User.findOne({ where: { id: decode.id } });

  if (!user) next(new AppError("User not found, Please login again.", 401));

  req.user = decode;
  next();
});

module.exports.AuthorizeRoles = (...roles) => {
  return CatchAsync(async (req, res, next) => {
    if (!roles.includes(req.user.role))
      return next(
        new AppError("Access denied: You don't have permissions", 403)
      );

    next();
  });
};

module.exports.CheckPermission = (
  moduleName,
  paramValue = "",
  modelName = "",
  testValue = ""
) =>
  CatchAsync(async (req, res, next) => {
    const { method, user } = req;
    const { [paramValue]: param } = req.params;

    const module = await Models.Module.findOne({
      where: { title: moduleName },
    });

    if (!module) return next(new AppError("Not Found: Module Not Found", 404));

    let permission = await Models.Permission.findOne({
      where: {
        roleId: user.roleId,
        designationId: user.designationId,
        moduleId: module.id,
      },
    });

    permission = Helpers.convertToPlainJSObject(permission);

    let modelData = null;
    // console.log("testValue ==>", [testValue]);
    // console.log("Param value ==>", paramValue);

    if (param)
      modelData = await modelName?.findOne({
        where: { [Op.and]: [{ [testValue]: user.id }, { id: param }] },
      });
    // console.log("Model name", modelName);
    // console.log("Model data", modelData);
    // console.log(permission && permission[RequestMethods[method]]);

    if (permission && permission[RequestMethods[method]]) {
      if (permission["self"] && !modelData)
        return next(
          new AppError(
            "Access denied: You only have a permission to update data related to you!",
            403
          )
        );
      return next();
    }

    return next(new AppError("Access denied: You don't have permissions", 403));
  });

module.exports.CheckTaskPermission = (
  moduleName,
  paramValue = "",
  modelName = ""
) =>
  CatchAsync(async (req, res, next) => {
    const { method, user } = req;
    const { [paramValue]: param } = req.params;

    const module = await Models.Module.findOne({
      where: { title: moduleName },
    });

    if (!module) return next(new AppError("Not Found: Module Not Found", 404));

    let permission = await Models.Permission.findOne({
      where: {
        roleId: user.roleId,
        designationId: user.designationId,
        moduleId: module.id,
      },
    });
    permission = Helpers.convertToPlainJSObject(permission);

    let employee = null;
    let model;
    if (param) {
      model = await modelName.findOne({ where: { id: param } });

      if (!model)
        return next(new AppError("Not Found: Task or Project Not Found", 404));

      employee = await Models.ProjectEmployee.findOne({
        where: {
          projectId: model.projectId ? model.projectId : model.id,
          employeeId: user.id,
        },
      });
    }

    if (permission && permission[RequestMethods[method]]) {
      if (user.isClient) {
        if (
          !req.body.data?.projectId &&
          model.clientId &&
          model.clientId === user.id
        )
          return next();

        if (
          !req.body.data?.projectId &&
          model.clientId &&
          model.clientId !== user.id
        )
          return next(
            new AppError(
              "Access denied: You havet no permission because you are not client of this project!",
              403
            )
          );

        if (req.body.data?.projectId) {
          let clientCheck = await Models.Project.findOne({
            where: {
              id: req.body.data.projectId,
              clientId: user.id,
            },
          });
          if (clientCheck) return next();
          else {
            return next(
              new AppError(
                "Access denied: You havet no permission because you are not client of this project!",
                403
              )
            );
          }
        }

        let isClient = await Models.Task.findOne({
          where: { id: model?.id },
          include: [
            {
              model: Models.Project,
              where: { clientId: user.id },
              required: true,
            },
          ],
        });

        if (isClient) return next();

        return next(
          new AppError(
            "Access denied: You havet no permission because you are not client of this project!",
            403
          )
        );
      }

      if (permission["self"] && user.id === model?.employeeId) return next();

      if (permission["self"] && employee && !model?.employeeId) return next();

      if (permission["self"] && employee) {
        if (employee.isLead) return next();
        return next(
          new AppError(
            "project employee but not task employee to perform this acticity",
            403
          )
        );
      }

      if (permission["self"] && !employee) {
        if (req.body.data?.projectId) {
          const { projectId } = req.body.data;
          let isEmployee = await Models.ProjectEmployee.findOne({
            where: { projectId: projectId, employeeId: user.id },
          });
          if (isEmployee) return next();
        }
        return next(
          new AppError(
            "Access denied: You have no permission to this task data!",
            403
          )
        );
      }
      return next();
    } else
      return next(
        new AppError("Access denied: You don't have permissions", 403)
      );
  });

module.exports.CheckTaskCommunicationPermission = (
  moduleName,
  paramValue = "",
  modelName = ""
) =>
  CatchAsync(async (req, res, next) => {
    const { method, user } = req;
    const { [paramValue]: param } = req.params;

    const module = await Models.Module.findOne({
      where: { title: moduleName },
    });

    if (!module) return next(new AppError("Not Found: Module Not Found", 404));

    let permission = await Models.Permission.findOne({
      where: {
        roleId: user.roleId,
        designationId: user.designationId,
        moduleId: module.id,
      },
    });
    permission = Helpers.convertToPlainJSObject(permission);

    let employee = undefined;
    let task = null;
    let model = undefined;
    console.log(modelName);
    if (param) {
      model = await modelName.findOne({ where: { id: param } });
      if (!model)
        return next(
          new AppError(`Not Found, ${typeof modelName} Not found`, 404)
        );
      // console.log(model);
      if (model.taskId) {
        task = await Models.Task.findOne({ where: { id: model.taskId } });
        task = Helpers.convertToPlainJSObject(task);
      }
      employee = await Models.ProjectEmployee.findOne({
        where: {
          projectId: task ? task.projectId : model.projectId,
          employeeId: user.id,
        },
      });
    }

    if (permission && permission[RequestMethods[method]]) {
      if (user.isClient) {
        let projectIdParam = task ? task.projectId : model?.projectId;
        let getTasks = undefined;
        if (req.body?.data?.taskId) {
          getTasks = await Models.Task.findOne({
            where: { id: req.body?.data?.taskId },
          });
        }
        let projectIdBody = getTasks?.projectId;

        let projectClient = await Models.Project.findOne({
          where: {
            id: projectIdParam ? projectIdParam : projectIdBody,
            clientId: user.id,
          },
        });

        if (projectClient) return next();
        else {
          return next(
            new AppError(
              "Access denied: You havet no permission because you are not client of this project!",
              403
            )
          );
        }
      }

      if (permission["self"] && employee) return next();

      if (permission["self"] && !employee) {
        if (req.body.data?.taskId) {
          const { taskId } = req.body.data;
          let getTask = await Models.Task.findOne({
            where: { id: taskId },
          });
          const Projectemployee = await Models.ProjectEmployee.findOne({
            where: { projectId: getTask.projectId, employeeId: user.id },
          });
          if (Projectemployee) return next();
        }
        return next(
          new AppError(
            "Access denied: You havet no permission to this project's Tasks!",
            403
          )
        );
      }
      return next();
    } else
      return next(
        new AppError("Access denied: You don't have permissions", 403)
      );
  });

module.exports.CheckBugPermission = (moduleName) =>
  CatchAsync(async (req, res, next) => {
    const { method, user } = req;

    const moduleData = await Models.Module.findOne({
      where: { title: moduleName },
    });

    if (!moduleData)
      return next(new AppError("Not Found: Module Not Found", 404));

    let permission = await Models.Permission.findOne({
      where: {
        roleId: user.roleId,
        designationId: user.designationId,
        moduleId: moduleData.id,
      },
    });

    permission = Helpers.convertToPlainJSObject(permission);

    let modelData = null;

    if (permission && permission[RequestMethods[method]]) {
      return next();
    }

    return next(new AppError("Access denied: You don't have permissions", 403));
  });
