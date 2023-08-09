const express = require("express");

const usersController = require("../controllers/User.controller");
const { Authenticate, CheckPermission } = require("../middlewares/Auth");

const userUpload = require("../middlewares/UploadS3");
const { validateInputData } = require("../utils/Helpers");
const {
  validateLogin,
  validateAddUser,
  validateUpdateLeave,
  validateChangeStatusLeave,
  validateApplyForLeave,
  validateDeleteAndUpdateUser,
  ValidatePicture,
  validateLeaveSettings,
  validateGetLeaveQuery
} = require("../validators/user");
const Models = require("../models");
const { Route53RecoveryCluster } = require("aws-sdk");

const router = express.Router();
router.post("/login", validateLogin, validateInputData, usersController.login);
router.post("/logout", usersController.logout);
router.get('/image/*', usersController.returnDocument)

router.use(Authenticate);

router.patch(
  "/cnic/:id",
  CheckPermission("UserMangament", "id", Models.User, "id"),
  userUpload.array("files"),
  ValidatePicture,
  validateDeleteAndUpdateUser,
  validateInputData,
  usersController.addCnicPhotos
);

router.patch(
  "/profile-photo/:id",
  CheckPermission("UserMangament", "id", Models.User, "id"),
  userUpload.array("files"),
  ValidatePicture,
  validateDeleteAndUpdateUser,
  validateInputData,
  usersController.addProfilePhoto
);

router.get(
  "/leave-setting",
  CheckPermission("UserMangament"),
  validateInputData,
  usersController.getLeaveSetting
);

router.post(
  "/leave-setting",
  CheckPermission("UserMangament"),
  validateLeaveSettings,
  validateInputData,
  usersController.leaveSetting
);

router.delete(
  "/leave-setting",
  CheckPermission("UserMangament"),
  validateInputData,
  usersController.deleteLeaveSetting
);

router.get(
  "/leads",
  CheckPermission("UserMangament"),
  validateInputData,
  usersController.getLeads
);
router.get(
  "/leaves/remaining-leaves/:id",
  CheckPermission("UserMangament", "id", Models.User, "id"),
  validateDeleteAndUpdateUser,
  validateInputData,
  usersController.getRemainingLeave
);

router
  .route("/leaves")
  .get(validateGetLeaveQuery,
    validateInputData,
    usersController.getLeaveApplications)
  .post(
    validateApplyForLeave,
    validateInputData,
    usersController.applyForLeaves
  );
router.use(Authenticate);
router
  .route("/")
  .get(
    CheckPermission("UserMangament"),
    validateInputData,
    usersController.getUsers
  )
  .post(
    CheckPermission("UserMangament"),
    validateAddUser,
    validateInputData,
    usersController.addUser
  );

router.get(
  "/projects/:id",
  validateDeleteAndUpdateUser,
  validateInputData,
  usersController.getUserProjects
);

router.get(
  "/client-projects/:id",
  validateDeleteAndUpdateUser,
  validateInputData,
  usersController.getClientProjects
);
router
  .route("/:id")
  .put(
    CheckPermission("UserMangament", "id", Models.User, "id"),
    validateDeleteAndUpdateUser,
    validateInputData,
    usersController.softDeleteUser
  )
  .get(
    CheckPermission("UserMangament", "id", Models.User, "id"),
    validateDeleteAndUpdateUser,
    validateInputData,
    usersController.userInfo
  )
  .delete(
    CheckPermission("UserMangament"),
    validateDeleteAndUpdateUser,
    validateInputData,
    usersController.deleteUser
  )
  .patch(
    CheckPermission("UserMangament", "id", Models.User, "id"),
    validateDeleteAndUpdateUser,
    validateInputData,
    usersController.updateUser
  );
router.patch(
  "/leaves/:leaveId",
  // CheckPermission(
  //   "LeaveMangament",
  //   "leaveId",
  //   Models.LeaveApplication,
  //   "userId"
  // ),
  validateUpdateLeave,
  validateInputData,
  usersController.updateLeave
);
router.patch(
  "/leaves/change-status/:leaveId",
  // CheckPermission(
  //   "LeaveMangament",
  //   "leaveId",
  //   Models.LeaveApplication,
  //   "userId"
  // ),
  validateChangeStatusLeave,
  validateInputData,
  usersController.changeLeaveStatus
);

router.delete(
  "/leaves/delete-leave/:leaveId",
  // CheckPermission(
  //   "LeaveMangament",
  //   "leaveId",
  //   Models.LeaveApplication,
  //   "userId"
  // ),
  validateUpdateLeave,
  validateInputData,
  usersController.deleteLeave
);


module.exports = router;
