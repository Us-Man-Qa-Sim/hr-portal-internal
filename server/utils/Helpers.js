const jsonwebtoken = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const AppError = require("../utils/AppError");
const Models = require("../models");
let { Op, where, fn, col } = require("sequelize");

var fs = require("fs");

module.exports.removePassword = (object) => {
  return { ...object, password: undefined };
};

module.exports.removeDelete = (object) => {
  return { ...object, deleted: undefined };
};

module.exports.convertToPlainJSObject = (item) => {
  return JSON.parse(JSON.stringify(item));
};

module.exports.generateToken = (user) => {
  return jsonwebtoken.sign(user, process.env.JSON_TOKEN, {
    expiresIn: "30d",
  });
};

module.exports.validateToken = (token) => {
  return jsonwebtoken.verify(token, process.env.JSON_TOKEN);
};

module.exports.validateInputData = (req, _res, next) => {
  const result = validationResult(req);
  if (!result.isEmpty()) next(new AppError(result.array()[0].msg, 400));
  else next();
};

module.exports.deleteFile = async (fileName) => {
  console.log("Going for Delete Boss");
  fs.unlinkSync(fileName);
};

module.exports.getCurrentSprintNumber = async () => {
  let sprint = await Models.Sprint.findOne({
    where: {
      startDate: {
        [Op.lte]: new Date(),
      },
      endDate: {
        [Op.gte]: new Date(),
      },
    },
  });

  if (sprint) return sprint
  return undefined
}
