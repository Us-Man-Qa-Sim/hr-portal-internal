const express = require("express");

const { Authenticate } = require("../middlewares/Auth");
const storageController = require("../controllers/Storage.controller");
const uploadS3 = require("../middlewares/UploadS3");

const router = express.Router();

router.use(Authenticate);

router.get("/", storageController.getObjects);
router.post("/", storageController.createObject);
router.delete("/", storageController.deleteObject);
router.post("/add-files", uploadS3.array("files"), storageController.addFiles);

module.exports = router;
