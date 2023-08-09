const Models = require("../models");
const AppError = require("../utils/AppError");
const CatchAsync = require("../utils/CatchAsync");
const Helpers = require("../utils/Helpers");

module.exports.addEducation = CatchAsync(async (req, res, next) => {
  {
    const { id } = req.params;
    let { educationData } = req.body.data;

    const checkUserInDB = await Models.User.findOne({ where: { id } });
    if (!checkUserInDB)
      return next(new AppError("Invalid ID. User not found", 404));

    educationData = educationData.map((item) => {
      return {
        userId: id,
        institute: item.institute,
        subject: item.subject,
        degree: item.degree,
        startDate: item.startDate,
        endDate: item.endDate,
        grade: item.grade ? item.grade : null,
      };
    });

    let education = await Models.Education.bulkCreate(educationData);
    education = Helpers.convertToPlainJSObject(education);

    return res.status(200).json({
      status: "success",
      message: "Education Information added successfully",
      data: {
        education,
      },
    });
  }
});

module.exports.getEducation = CatchAsync(async (req, res, next) => {
  const { id } = req.params;

  const checkUserInDB = await Models.User.findOne({ where: { id } });
  if (!checkUserInDB)
    return next(new AppError("Invalid ID. User not found", 404));

  let education = await Models.Education.findAll({
    where: {
      userId: id,
    },
    order: [["createdAt", "asc"]],
  });

  return res.status(200).json({
    status: "success",
    message: "All Educational Information of user is fecthed successfully",
    data: {
      education,
    },
  });
});

module.exports.deleteEducation = CatchAsync(async (req, res, next) => {
  const { id } = req.params;

  const checkEducationInDB = await Models.Education.findOne({
    where: { id },
  });
  if (!checkEducationInDB)
    return next(new AppError("Invalid ID. Education not found", 404));

  await Models.Education.destroy({
    where: {
      id,
    },
  });

  return res.status(200).json({
    status: "success",
    message: "Education of user is deleted successfully",
    id,
  });
});
