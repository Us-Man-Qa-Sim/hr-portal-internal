const multer = require("multer");

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './storage/user',)
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
})

var userUpload = multer({
  storage: storage,
  limits: {
    fileSize: 52428800
  }
})

module.exports = userUpload;