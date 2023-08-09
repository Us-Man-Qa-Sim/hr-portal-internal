const Models = require("../models");
const AppError = require("../utils/AppError");
const CatchAsync = require("../utils/CatchAsync");
const Helpers = require("../utils/Helpers");
const Paginate = require("../utils/Paginate");

module.exports.addQuestion = CatchAsync(async (req, res, next) => {
  {
    const { text, departmentId } = req.body.data;

    const checkDepartmentInDB = await Models.Department.findOne({
      where: { id: departmentId, deleted: false },
    });
    if (!checkDepartmentInDB)
      return next(new AppError("Invalid ID. Department not found", 404));

    let question = await Models.Question.create({
      text: text,
      departmentId: departmentId,
    });

    question = Helpers.convertToPlainJSObject(question);

    return res.status(200).json({
      status: "success",
      message: "Question added successfully",
      data: {
        question,
      },
    });
  }
});

module.exports.getQuestions = CatchAsync(async (req, res, next) => {
  const { query } = req;
  const pagination = await Paginate(
    Models.Question,
    {},
    query.page,
    query.limit
  );

  let questions = await Models.Question.findAll({
    order: [["createdAt", "desc"]],
    limit: pagination.limit,
    offset: pagination.offset,
  });

  return res.status(200).json({
    status: "success",
    message: "All question fecthed successfully",
    data: {
      questions,
      pagination,
    },
  });
});

module.exports.getDepartmentQuestions = CatchAsync(async (req, res, next) => {
  const { departmentId } = req.body.data;
  const { query } = req;

  const checkDepartmentInDB = await Models.Department.findOne({
    where: { id: departmentId, deleted: false },
  });
  if (!checkDepartmentInDB)
    return next(new AppError("Invalid ID. Department not found", 404));

  const pagination = await Paginate(
    Models.Question,
    {},
    query.page,
    query.limit
  );

  let questions = await Models.Question.findAll({
    where: { departmentId: departmentId },
    order: [["createdAt", "desc"]],
    limit: pagination.limit,
    offset: pagination.offset,
  });

  return res.status(200).json({
    status: "success",
    message: "Department questions fecthed successfully",
    data: {
      questions,
      pagination,
    },
  });
});

module.exports.updateQuestion = CatchAsync(async (req, res, next) => {
  const { id } = req.params;

  let checkQuestionTnDB = await Models.Question.findOne({ where: { id: id } });

  if (!checkQuestionTnDB)
    return next(new AppError("Invalid ID. Question not found", 404));

  if (req.body.data) {
    const { data } = req.body;
    if (data.departmentId) {
      const checkDepartmentInDB = await Models.Department.findOne({
        where: { id: data.departmentId, deleted: false },
      });
      if (!checkDepartmentInDB)
        return next(new AppError("Invalid ID. Department not found", 404));
    }
    let [, [question]] = await Models.Question.update(
      { ...req.body.data },
      { where: { id }, returning: true }
    );

    question = Helpers.convertToPlainJSObject(question);

    return res.status(200).json({
      status: "success",
      message: "Question updated successfully",
      data: {
        question,
      },
    });
  }
  return res.status(200).json({
    status: "fail",
    message: "No Data is given to update the question",
  });
});
