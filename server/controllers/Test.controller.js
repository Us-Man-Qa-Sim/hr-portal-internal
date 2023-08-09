const Models = require("../models");
const AppError = require("../utils/AppError");
const CatchAsync = require("../utils/CatchAsync");
const Helpers = require("../utils/Helpers");
const Paginate = require("../utils/Paginate");
const { uid } = require("uid");
const email = require("../email/sendEmail");

module.exports.createTest = CatchAsync(async (req, res, next) => {
  const { title, departmentId, questions } = req.body.data;

  const checkDepartmentInDB = await Models.Department.findOne({
    where: { id: departmentId, deleted: false },
  });
  if (!checkDepartmentInDB)
    return next(new AppError("Invalid ID. Department not found", 404));

  let test = await Models.Test.create({
    departmentId: departmentId,
    token: uid(42),
    title: title,
  });

  test = Helpers.convertToPlainJSObject(test);

  let testQuestions = questions.map((queestion) => {
    return {
      testId: test.id,
      questionId: queestion,
    };
  });
  let testQuestion = await Models.TestQuestion.bulkCreate(testQuestions);

  res.status(200).json({
    status: "Success",
    message: "Test created Successfully",
    data: {
      test,
    },
  });
});

module.exports.assignUsers = CatchAsync(async (req, res, next) => {
  const { emails, testId } = req.body.data;

  const checkTestInDB = await Models.Test.findOne({
    where: { id: testId },
  });
  if (!checkTestInDB)
    return next(new AppError("Invalid ID. Test not found", 404));

  let tests = emails.map((email) => {
    return {
      email: email,
      testId: testId,
    };
  });

  let assignUsers = await Models.TestUser.bulkCreate(tests);

  assignUsers = Helpers.convertToPlainJSObject(assignUsers);

  // console.log(assignUsers);
  // console.log(checkTestInDB.token);

  const testEmail = assignUsers.map((user) => {
    return {
      email: user.email,
      token: checkTestInDB.token.concat(user.id),
    };
  });
  // console.log(testEmail);
  email.email(testEmail);
  res.status(200).json({
    status: "Success",
    message: "User assigned to test Successfully",
    data: {
      assignUsers,
    },
  });
});

module.exports.getTestQuestions = CatchAsync(async (req, res, next) => {
  const { id } = req.params;
  let token = id.slice(0, 42);
  //console.log(id, id.slice(42));
  let test = await Models.Test.findOne({ where: { token: token } });

  if (!test) return next(new AppError("Invalid ID. Test not found", 404));

  let testQuestions = await Models.TestQuestion.findAll({
    where: { testId: test.id },
    include: [
      {
        model: Models.Test,
        as: "test",
        attributes: ["title"],
      },
      {
        model: Models.Question,
        as: "testIdQuestion",
        attributes: ["text"],
      },
    ],
    attributes: { exclude: ["testId", "questionId", "createdAt", "updatedAt"] },
  });

  res.status(200).json({
    status: "Success",
    message: "Test questions fetched Successfully",
    data: {
      testQuestions,
    },
  });
});

module.exports.createAnswers = CatchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { answers } = req.body.data;

  let token = id.slice(0, 42);
  let testUser = id.slice(42);

  let test = await Models.Test.findOne({ where: { token: token } });

  if (!test) return next(new AppError("Invalid ID. Test not found", 404));

  let questionAnswers = answers.map((answerData) => {
    return {
      answer: answerData.answer ? answerData.answer : null,
      testId: test.id,
      questionId: answerData.questionId,
      testUserId: testUser,
    };
  });

  let createAnswers = await Models.Answer.bulkCreate(questionAnswers);

  let [, [updateTest]] = await Models.Test.update(
    { submitted: true },
    { where: { id: test.id }, returning: true }
  );

  res.status(200).json({
    status: "Success",
    message: "Test Submitted Successfully",
    data: {
      questionAnswers,
    },
  });
});

module.exports.getSubmittedTests = CatchAsync(async (req, res, next) => {
  const { query } = req;

  const pagination = await Paginate(Models.Test, {}, query.page, query.limit);

  let tests = await Models.Test.findAll({
    where: { submitted: true },
    order: [["createdAt", "desc"]],
    limit: pagination.limit,
    offset: pagination.offset,
  });

  return res.status(200).json({
    status: "success",
    message: "All Submitted Test fecthed successfully",
    data: {
      tests,
      pagination,
    },
  });
});

module.exports.getTestUsers = CatchAsync(async (req, res, next) => {
  const { id } = req.params;

  let test = await Models.Test.findOne({ where: { id, submitted: true } });

  if (!test) return next(new AppError("Invalid ID. Test not found", 404));

  let testUsers = await Models.TestUser.findAll({
    where: { testId: id },
    attributes: {
      exclude: ["createdAt", "updatedAt"],
    },
  });

  return res.status(200).json({
    status: "success",
    message: "All  Test users fecthed successfully",
    data: { testUsers },
  });
});

module.exports.getTestAnswer = CatchAsync(async (req, res, next) => {
  const { data } = req.body;
  console.log(req.body);

  let test = await Models.Test.findOne({
    where: { id: data.testId, submitted: true },
  });

  if (!test) return next(new AppError("Invalid ID. Test not found", 404));

  let user = await Models.TestUser.findOne({
    where: { id: data.testUserId, testId: data.testId },
  });

  if (!user) return next(new AppError("Invalid ID. Test user not found", 404));

  let testAnswers = await Models.Answer.findAll({
    where: {
      testId: data.testId,
      testUserId: data.testUserId,
    },
    include: [
      //   {
      //     model: Models.TestUser,
      //     as: "user",
      //     attributes: ["email"],
      //   },
      { model: Models.Question, as: "question", attributes: ["text"] },
    ],
    attributes: {
      exclude: ["questionId", "testUserId", "createdAt", "updatedAt"],
    },
  });
  if (testAnswers.length === 0) {
    return res.status(200).json({
      status: "fail",
      message: `Questions are not submitted`,
      data: { testAnswers },
    });
  }
  return res.status(200).json({
    status: "success",
    message: `All  answers of given user fecthed successfully`,
    data: { testAnswers },
  });
});
