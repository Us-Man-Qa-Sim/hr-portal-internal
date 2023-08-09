const Models = require("../models");
const AppError = require("../utils/AppError");
const CatchAsync = require("../utils/CatchAsync");
const Helpers = require("../utils/Helpers");
const Paginate = require("../utils/Paginate");

module.exports.addImageInProjectDocument = CatchAsync(
  async (req, res, next) => {
    const { projectId } = req.body;
    const files = req.files;

    const checkProjectInDB = await Models.Project.findOne({
      where: { id: projectId, deleted: false },
    });

    if (!checkProjectInDB)
      return next(new AppError("Invalid Id, Project doest not exist", 400));

    let imageData = [];
    imageData = files?.map((file) => {
      return {
        documentURL: `${process.env.URL}${file.path}`,
        projectId,
        isImage: true,
        name: file.originalname,
        size: file.size,
        type: file.mimetype,
      };
    });

    let projectDocuments = await Models.ProjectDocument.bulkCreate(imageData);
    projectDocuments = Helpers.convertToPlainJSObject(projectDocuments);

    return res.status(200).json({
      status: "success",
      message: "Project Documents Added Successfully.",
      data: {
        projectDocuments,
      },
    });
  }
);

module.exports.addDocInProjectDocument = CatchAsync(async (req, res, next) => {
  const { projectId } = req.body;
  const { user } = req;
  const files = req.files;

  const checkProjectInDB = await Models.Project.findOne({
    where: { id: projectId, deleted: false },
  });

  if (!checkProjectInDB)
    return next(new AppError("Invalid Id, Project doest not exist", 400));

  let documentData = [];
  documentData = files?.map((file) => {
    return {
      documentURL: `${process.env.URL}${file.path}`,
      projectId,
      isImage: false,
      userId: user.id,
      name: file.originalname,
      size: file.size,
      type: file.mimetype,
    };
  });

  let projectDocuments = await Models.ProjectDocument.bulkCreate(documentData);
  projectDocuments = Helpers.convertToPlainJSObject(projectDocuments);

  return res.status(200).json({
    status: "success",
    message: "Project Documents Added Successfully.",
    data: {
      projectDocuments,
    },
  });
});

module.exports.softDeleteProjectDocument = CatchAsync(
  async (req, res, next) => {
    const { id } = req.params;

    let checkDocumentInDB = await Models.ProjectDocument.findOne({
      where: { id, deleted: false },
    });

    if (!checkDocumentInDB)
      return next(
        new AppError(
          "Invalid ID. Document not found or not deleted softly",
          404
        )
      );

    await Models.ProjectDocument.destroy({ where: { id } });

    return res.status(200).json({
      status: "success",
      message: "Project Document deleted (soft) successfully",
      data: {
        id,
      },
    });
  }
);

module.exports.deleteDocument = CatchAsync(async (req, res, next) => {
  const { id } = req.params;

  let checkDocumentInDB = await Models.ProjectDocument.findOne({
    where: { id, deleted: false },
  });

  if (!checkDocumentInDB)
    return next(
      new AppError("Invalid ID. Document not found or not deleted softly", 404)
    );

  await Models.ProjectDocument.destroy({ where: { id } });

  return res.status(200).json({
    status: "success",
    message: "Project Document deleted successfully",
    data: {
      id,
    },
  });
});

module.exports.getProjectDocuments = CatchAsync(async (req, res, next) => {
  const { query } = req;
  const { id: projectId } = req.params;
  const pagination = await Paginate(
    Models.ProjectDocument,
    { projectId, isImage: false, deleted: false },
    query.page,
    query.limit
  );
  const checkProjectInDB = await Models.Project.findOne({
    where: { id: projectId, deleted: false },
  });

  if (!checkProjectInDB)
    return next(new AppError("Invalid Id, Project doest not exist", 400));

  let documents = await Models.ProjectDocument.findAll({
    where: { projectId, isImage: false, deleted: false },
    include: [{ model: Models.User, attributes: ["name", "email"] }],
    attributes: { exclude: ["deleted", "createdAt", "updatedAt"] },
    order: [["createdAt", "desc"]],
    limit: pagination.limit,
    offset: pagination.offset,
  });

  return res.status(200).json({
    status: "success",
    message: "All Documents (documents) fecthed successfully",
    data: {
      documents,
      pagination,
    },
  });
});

module.exports.getProjectImages = CatchAsync(async (req, res, next) => {
  const { query } = req;
  const { id: projectId } = req.params;

  const pagination = await Paginate(
    Models.ProjectDocument,
    { projectId, isImage: true, deleted: false },
    query.page,
    query.limit
  );

  const checkProjectInDB = await Models.Project.findOne({
    where: { id: projectId, deleted: false },
  });

  if (!checkProjectInDB)
    return next(new AppError("Invalid Id, Project doest not exist", 400));

  let documents = await Models.ProjectDocument.findAll({
    where: {
      projectId,
      isImage: true,
      deleted: false,
    },
    attributes: { exclude: ["deleted", "createdAt", "updatedAt"] },
    order: [["createdAt", "desc"]],
    limit: pagination.limit,
    offset: pagination.offset,
  });

  return res.status(200).json({
    status: "success",
    message: "All Documents (Images) fecthed successfully",
    data: {
      documents,
      pagination,
    },
  });
});

module.exports.updateImageInProjectDocument = CatchAsync(
  async (req, res, next) => {
    const { id } = req.params;
    const files = req.files;

    let checkDocumentInDB = await Models.ProjectDocument.findOne({
      where: { id, deleted: false, isImage: true },
    });
    if (!checkDocumentInDB)
      return next(new AppError("Invalid ID. Document not found", 404));

    let [, []] = await Models.ProjectDocument.update(
      { documentURL: `${process.env.URL}${files[0].path}` },
      { where: { id, deleted: false, isImage: true }, returning: true }
    );

    return res.status(200).json({
      status: "success",
      message: "Project Document updated successfully",
      data: {
        id,
      },
    });
  }
);

module.exports.updateDocInProjectDocument = CatchAsync(
  async (req, res, next) => {
    const { id } = req.params;
    const files = req.files;
    const { user } = req;

    let checkDocumentInDB = await Models.ProjectDocument.findOne({
      where: { id, deleted: false, isImage: false },
    });
    if (!checkDocumentInDB)
      return next(new AppError("Invalid ID. Document not found", 404));

    let [, []] = await Models.ProjectDocument.update(
      { documentURL: `${process.env.URL}${files[0].path}`, userId: user.id },
      { where: { id, deleted: false, isImage: false }, returning: true }
    );

    return res.status(200).json({
      status: "success",
      message: "Project Document updated successfully",
      data: {
        id,
      },
    });
  }
);
