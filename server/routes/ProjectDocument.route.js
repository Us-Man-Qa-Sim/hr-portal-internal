const express = require("express");
const uploadS3 = require("../middlewares/AssetsS3");
const projectDocumentController = require("../controllers/ProjectDocument.controller");
const { Authenticate, CheckPermission } = require("../middlewares/Auth");
const Models = require("../models");
const {
  validateAddImage,
  ValidatePicture,
  Validatefiles,
  ValidateUpdatePicture,
  validateIDparam,
  validateAddDocument,
} = require("../validators/projectDocument");
const { validateInputData } = require("../utils/Helpers");
const router = express.Router();

router.use(Authenticate);

router.post(
  "/images",
  CheckPermission("ProjectMangament"),
  uploadS3.array("files"),
  ValidatePicture,
  validateAddImage,
  validateInputData,
  projectDocumentController.addImageInProjectDocument
);

router.post(
  "/documents",
  CheckPermission("ProjectMangament"),
  uploadS3.array("files"),
  Validatefiles,
  validateAddDocument,
  validateInputData,
  projectDocumentController.addDocInProjectDocument
);

router.get(
  "/images/:id",
  CheckPermission("ProjectMangament", "id", Models.ProjectDocument, "id"),
  validateIDparam,
  validateInputData,
  projectDocumentController.getProjectImages
);
router.get(
  "/documents/:id",
  CheckPermission("ProjectMangament", "id", Models.ProjectDocument, "id"),
  validateIDparam,
  validateInputData,
  projectDocumentController.getProjectDocuments
);

router.put(
  "/documents/:id",
  CheckPermission("ProjectMangament", "id", Models.ProjectDocument, "id"),
  validateIDparam,
  validateInputData,
  projectDocumentController.softDeleteProjectDocument
);

router.delete(
  "/documents/:id",
  CheckPermission("ProjectMangament", "id", Models.ProjectDocument, "id"),
  validateIDparam,
  validateInputData,
  projectDocumentController.deleteDocument
);

router.patch(
  "/images/:id",
  CheckPermission("ProjectMangament", "id", Models.ProjectDocument, "id"),
  uploadS3.array("files"),
  ValidateUpdatePicture,
  validateIDparam,
  validateInputData,
  projectDocumentController.updateImageInProjectDocument
);

router.patch(
  "/documents/:id",
  CheckPermission("ProjectMangament", "id", Models.ProjectDocument, "id"),
  uploadS3.array("files"),
  Validatefiles,
  validateIDparam,
  validateInputData,
  projectDocumentController.updateDocInProjectDocument
);
module.exports = router;
