const multer = require("multer");

var filesStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './storage/files')
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
})

var fileUpload = multer({
  storage: filesStorage,
  limits: {
    fileSize: 52428800
  }
})
module.exports = fileUpload;
