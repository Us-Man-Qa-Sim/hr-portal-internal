const { check, param, body } = require("express-validator");

const AppError = require("../utils/AppError");

module.exports.validateAddImage = [
  body("projectId").exists().withMessage("Project Id is required"),
  body("isImage")
    .exists()
    .withMessage("Document type should be Image")
    .equals("true")
    .withMessage("isImage must be true"),
];
module.exports.validateAddDocument = [
  body("projectId").exists().withMessage("Project Id is required"),
];

module.exports.validateIDparam = [
  param("id").exists().withMessage("Project Id is required as param"),
];

module.exports.ValidatePicture = async (req, res, next) => {
  if (!req.files || req.files.length === 0) {
    next(new AppError("File is required", 400));
  }

  req.files?.map((file) => {
    if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
    } else next(new AppError("Only PNG and JPEG are allowed", 400));
  });

  next();
  // if (mimetype == "image/jpeg" || mimetype == "image/png") next();
  // else next(new AppError("Only PNG and JPEG are allowed", 400));
};

module.exports.Validatefiles = async (req, res, next) => {
  if (!req.files || req.files.length === 0) {
    next(new AppError("File is required", 400));
  }
  next();
};

module.exports.ValidateUpdatePicture = async (req, res, next) => {
  if (!req.files || req.files.length === 0)
    next(new AppError("file is required", 400));

  if (
    req.files[0].mimetype === "image/jpeg" ||
    req.files[0].mimetype === "image/png"
  )
    next();
  else next(new AppError("Only PNG and JPEG are allowed", 400));
};
