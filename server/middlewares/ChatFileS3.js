const multer = require("multer");
const multerS3 = require("multer-s3");

const S3 = require("../configs/Storage");

const ChatFileS3 = multer({
  storage: multerS3({
    s3: S3,
    acl: "public-read",
    bucket: process.env.AWS_CHAT_BUCKET,
    key: (req, file, next) => {
      next(null, `${Date.now().toString()} - ${file.originalname}`);
    },
  }),
});

module.exports = ChatFileS3;
