const S3 = require("../configs/Storage");
const AppError = require("../utils/AppError");
const CatchAsync = require("../utils/CatchAsync");
const Models = require("../models");
const { notificationTypes } = require("../configs/Constants");
const Helpers = require("../utils/Helpers");
const { Op } = require("sequelize");

module.exports.getObjects = CatchAsync(async (req, res, next) => {
  const { prefix } = req.query;

  const bucketParams = {
    Bucket: process.env.AWS_BUCKET,
    Prefix: prefix,
    Delimiter: "/",
  };

  const result = await S3.listObjectsV2(bucketParams).promise();

  return res.status(200).json({
    status: "success",
    message: "Objects found successfully",
    data: {
      totalFiles: result.Contents.length,
      totalFolders: result.CommonPrefixes.length,
      files: result.Contents,
      folders: result.CommonPrefixes,
    },
  });
});

module.exports.createObject = CatchAsync(async (req, res, next) => {
  const { data } = req.body;
  const { user } = req;
  const params = {
    Bucket: process.env.AWS_BUCKET,
    Key: `${data.prefix}${data.folderName}/`,
  };

  await S3.putObject(params).promise();

  let users = await Models.User.findAll({
    where: {
      [Op.not]: {
        id: user.id,
      },
    },
  });

  users = Helpers.convertToPlainJSObject(users);

  const notification = await Models.Notification.create({
    type: notificationTypes.INFO,
    title: "Folder created",
    message: `${user.name} created folder ${data.folderName} at ${
      data.prefix ? data.prefix : "Home/"
    }${data.folderName}`,
  });

  await Models.Notifies.bulkCreate(
    users.map((item) => {
      return {
        notificationId: notification.id,
        from: user.id,
        to: item.id,
      };
    })
  );

  return res.status(200).json({
    status: "success",
    message: "Folder Created Successfully",
  });
});

module.exports.deleteObject = CatchAsync(async (req, res, next) => {
  const { prefix } = req.query;

  const params = {
    Bucket: process.env.AWS_BUCKET,
    Prefix: prefix,
  };

  const allFiles = await S3.listObjectsV2(params).promise();
  if (allFiles.Contents.length === 0)
    return next(new AppError("Files and folder are not exists", 404));

  const deleteParams = {
    Bucket: process.env.AWS_BUCKET,
    Delete: { Objects: [] },
  };

  allFiles.Contents.forEach((item) => {
    deleteParams.Delete.Objects.push({ Key: item.Key });
  });

  const result = await S3.deleteObjects(deleteParams).promise();

  return res.status(200).json({
    status: "success",
    message: "Deleted Successfully",
    data: { result },
  });
});

module.exports.addFiles = CatchAsync(async (req, res, next) => {
  return res.status(200).json({
    status: "success",
    message: "Files Upload successfully!",
    data: {
      files: req.files,
    },
  });
});
