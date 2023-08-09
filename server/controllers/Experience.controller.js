const Models = require("../models");
const AppError = require("../utils/AppError");
const CatchAsync = require("../utils/CatchAsync");
const Helpers = require("../utils/Helpers");

module.exports.addExperience = CatchAsync(async (req, res, next) => {
  {
    const { id } = req.params;
    let { experienceData } = req.body.data;

    const checkUserInDB = await Models.User.findOne({ where: { id } });
    if (!checkUserInDB)
      return next(new AppError("Invalid ID. User not found", 404));

    experienceData = experienceData.map((item) => {
      return {
        userId: id,
        jobPosition: item.jobPosition,
        company: item.company,
        location: item.location,
        startDate: item.startDate,
        endDate: item.endDate,
      };
    });

    let experience = await Models.Experience.bulkCreate(experienceData);
    experience = Helpers.convertToPlainJSObject(experience);
    return res.status(200).json({
      status: "success",
      message: "Experience added successfully",
      data: {
        experience,
      },
    });
  }
});

module.exports.getExperience = CatchAsync(async (req, res, next) => {
  const { id } = req.params;

  const checkUserInDB = await Models.User.findOne({ where: { id } });
  if (!checkUserInDB)
    return next(new AppError("Invalid ID. User not found", 404));

  let experiecne = await Models.Experience.findAll({
    where: {
      userId: id,
    },
  });

  return res.status(200).json({
    status: "success",
    message: "All Experience of user is fecthed successfully",
    data: {
      experiecne,
    },
  });
});

module.exports.deleteExperience = CatchAsync(async (req, res, next) => {
  const { id } = req.params;

  const checkExperienceInDB = await Models.Experience.findOne({
    where: { id },
  });
  if (!checkExperienceInDB)
    return next(new AppError("Invalid ID. Experience not found", 404));

  await Models.Experience.destroy({
    where: {
      id,
    },
  });

  return res.status(200).json({
    status: "success",
    message: "Experience of user is deleted successfully",
    id,
  });
});
