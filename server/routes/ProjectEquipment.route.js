const express = require("express");

const projectEquipmentController = require("../controllers/ProjectEquipment.controller");
const { Authenticate } = require("../middlewares/Auth");
const {
  validateAddProjectEquipemt,
  validateIDparam,
} = require("../validators/projectEquipment");
const { validateInputData } = require("../utils/Helpers");
const router = express.Router();

router.use(Authenticate);

router.post(
  "/",
  validateAddProjectEquipemt,
  validateInputData,
  projectEquipmentController.addProjectEquipemt
);
router.get("/", projectEquipmentController.getProjectEquipemt);

router
  .route("/:id")
  .delete(
    validateIDparam,
    validateInputData,
    projectEquipmentController.deleteProjectEquipment
  )
  .patch(
    validateIDparam,
    validateInputData,
    projectEquipmentController.updateProjectEquipment
  )
  .put(
    validateIDparam,
    validateInputData,
    projectEquipmentController.softDeleteProjectEquipmet
  );

module.exports = router;
