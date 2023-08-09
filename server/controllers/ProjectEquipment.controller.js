const Models = require("../models");
const AppError = require("../utils/AppError");
const CatchAsync = require("../utils/CatchAsync");
const Helpers = require("../utils/Helpers");
const Paginate = require("../utils/Paginate");

module.exports.addProjectEquipemt = CatchAsync(async (req, res, next) => {
  const { data } = req.body;

  const checkProjectInDB = await Models.Project.findOne({
    where: { id: data.projectId, deleted: false },
  });

  if (!checkProjectInDB)
    return next(new AppError("Invalid, Project does not Exist", 400));

  let projectEquipment = await Models.ProjectEquipment.create({ ...data });

  projectEquipment = Helpers.convertToPlainJSObject(projectEquipment);

  projectEquipment = Helpers.removeDelete(projectEquipment);

  return res.status(200).json({
    status: "success",
    message: "Project Equipment added successfully",
    data: {
      projectEquipment,
    },
  });
});

module.exports.getProjectEquipemt = CatchAsync(async (req, res, next) => {
  const { query } = req;
  let whereClause = {};
  if (query.equipmentId) {
    whereClause["deleted"] = false;
    whereClause["id"] = query.equipmentId;
  } else {
    whereClause["deleted"] = false;
  }
  const pagination = await Paginate(
    Models.ProjectEquipment,
    whereClause,
    query.page,
    query.limit
  );

  let projectEquipments = await Models.ProjectEquipment.findAll({
    where: whereClause,
    include: [
      {
        model: Models.Project,
        attributes: ["id", "title", "startDate"],
      },
    ],
    attributes: { exclude: ["deleted", "projectId", "createdAt", "updatedAt"] },
    limit: pagination.limit,
    offset: pagination.offset,
    order: [["createdAt", "desc"]],
  });

  projectEquipments = Helpers.convertToPlainJSObject(projectEquipments);

  return res.status(200).json({
    status: "success",
    message: "Project Equipment fetched successfully",
    data: {
      projectEquipments,
      pagination,
    },
  });
});

module.exports.softDeleteProjectEquipmet = CatchAsync(
  async (req, res, next) => {
    const { id } = req.params;

    let checkProjectEquipmentInDB = await Models.ProjectEquipment.findOne({
      where: { id, deleted: false },
    });

    if (!checkProjectEquipmentInDB)
      return next(new AppError("Invalid ID. Project Equipment not found", 404));

    let [, [projectEquipment]] = await Models.ProjectEquipment.update(
      { deleted: true },
      { where: { id }, returning: true }
    );

    return res.status(200).json({
      status: "success",
      message: "Project Equipment deleted (soft) successfully",
      data: {
        id,
      },
    });
  }
);

module.exports.deleteProjectEquipment = CatchAsync(async (req, res, next) => {
  const { id } = req.params;

  let checkProjectEquipmentInDB = await Models.ProjectEquipment.findOne({
    where: { id, deleted: true },
  });

  if (!checkProjectEquipmentInDB)
    return next(
      new AppError(
        "Invalid ID. Project Equipment not found or Not softly deleted",
        404
      )
    );

  await Models.ProjectEquipment.destroy({ where: { id, deleted: true } });

  return res.status(200).json({
    status: "success",
    message: "Project Equipment deleted successfully",
    data: {
      id,
    },
  });
});

module.exports.updateProjectEquipment = CatchAsync(async (req, res, next) => {
  const { id } = req.params;

  let checkProjectEquipmentInDB = await Models.ProjectEquipment.findOne({
    where: { id, deleted: false },
  });

  if (!checkProjectEquipmentInDB)
    return next(new AppError("Invalid ID. Project Equipment not found", 404));
  if (!req.body.data) {
    return res.status(424).json({
      status: "fail",
      message: "No Data is given to update the Project Equipment",
    });
  }

  let [, [projectEquipment]] = await Models.ProjectEquipment.update(
    { ...req.body.data },
    { where: { id }, returning: true }
  );

  return res.status(200).json({
    status: "success",
    message: "projectEquipment updated successfully",
    data: {
      id,
    },
  });
});
