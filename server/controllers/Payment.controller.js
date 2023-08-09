const Models = require("../models");
const AppError = require("../utils/AppError");
const CatchAsync = require("../utils/CatchAsync");
const Helpers = require("../utils/Helpers");
const Paginate = require("../utils/Paginate");
const { paymentType } = require("../configs/Constants");
const sequelize = require("sequelize");

module.exports.addDebit = CatchAsync(async (req, res, next) => {
  const { data } = req.body;
  console.log(data);
  let checkProjectInDB = await Models.Project.findOne({
    where: { id: data.projectId, deleted: false },
  });

  if (!checkProjectInDB)
    return next(new AppError("Invalid ID. Project not found", 404));

  let debit = await Models.Payment.create(data);
  debit = Helpers.convertToPlainJSObject(debit);

  return res.status(200).json({
    status: "success",
    message: "Payment added successfully",
    data: {
      debit,
    },
  });
});

module.exports.addCredit = CatchAsync(async (req, res, next) => {
  const { data } = req.body;

  let checkPaymentHeadInDB = await Models.PaymentHead.findOne({
    where: { id: data.paymentHeadId, deleted: false },
  });

  if (!checkPaymentHeadInDB)
    return next(new AppError("Invalid ID. Payment Head not found", 404));

  let credit = await Models.Payment.create(data);
  credit = Helpers.convertToPlainJSObject(credit);

  return res.status(200).json({
    status: "success",
    message: "Payment added successfully",
    data: {
      credit,
    },
  });
});

module.exports.getCredits = CatchAsync(async (req, res, next) => {
  const { query } = req;

  const pagination = await Paginate(
    Models.Payment,
    {},
    query.page,
    query.limit
  );
  let credits = await Models.Payment.findAll({
    order: [["createdAt", "desc"]],
    limit: pagination.limit,
    offset: pagination.offset,
    where: {
      deleted: false,
      paymentType: paymentType.CREDIT,
    },
    include: [
      {
        model: Models.PaymentHead,
        as: "paymentHead",
        attributes: [["id", "paymentHeadId"], "title"],
      },
    ],
    attributes: {
      exclude: [
        "deleted",
        "createdAt",
        "updatedAt",
        "debitType",
        "projectId",
        "paymentHeadId",
      ],
    },
  });

  return res.status(200).json({
    status: "success",
    message: "All credits fecthed successfully",
    data: {
      credits,
      pagination,
    },
  });
});

module.exports.getDebits = CatchAsync(async (req, res, next) => {
  const { query } = req;

  const pagination = await Paginate(
    Models.Payment,
    {},
    query.page,
    query.limit
  );
  let debits = await Models.Payment.findAll({
    order: [["createdAt", "desc"]],
    include: [
      {
        model: Models.Project,
        as: "project",
        attributes: [["id", "projecId"], "title"],
      },
    ],
    limit: pagination.limit,
    offset: pagination.offset,
    where: {
      deleted: false,
      paymentType: paymentType.DEBIT,
    },
    attributes: {
      exclude: [
        "deleted",
        "createdAt",
        "updatedAt",
        "projectId",
        "paymentHeadId",
      ],
    },
  });

  return res.status(200).json({
    status: "success",
    message: "All debits fecthed successfully",
    data: {
      debits,
      pagination,
    },
  });
});

module.exports.getPayments = CatchAsync(async (req, res, next) => {
  const { query } = req;

  const pagination = await Paginate(
    Models.Payment,
    {},
    query.page,
    query.limit
  );
  let credits = await Models.Payment.findAll({
    attributes: {
      exclude: [
        "deleted",
        "createdAt",
        "updatedAt",
        "projectId",
        "paymentHeadId",
      ],
    },
    where: {
      deleted: false,
    },
    include: [
      {
        model: Models.PaymentHead,
        as: "paymentHead",
        attributes: [["id", "paymentHeadId"], "title"],
      },
      {
        model: Models.Project,
        as: "project",
        attributes: [["id", "projecId"], "title"],
      },
    ],

    order: [
      ["date", "DESC"],
      ["paymentType", "DESC"],
    ],
    limit: pagination.limit,
    offset: pagination.offset,
  });
  // let credits = await Models.Payment.findAll({
  //   attributes: [
  //     [sequelize.literal(`DATE("date")`), "date"],
  //     [sequelize.literal(`COUNT(*)`), "count"],
  //   ],
  //   group: ["date"],
  //   order: [["date", "desc"]],
  // });

  // let credits = await Models.Payment.findAll({
  //   order: [
  //     ["date", "DESC"],
  //     ["paymentType", "DESC"],
  //   ],
  // });

  return res.status(200).json({
    status: "success",
    message: "All credits fecthed successfully",
    data: {
      credits,
      pagination,
    },
  });
});

module.exports.updateCredit = CatchAsync(async (req, res, next) => {
  const { data } = req.body;
  const { id } = req.params;
  let checkCreditInDB = await Models.Payment.findOne({
    where: { id: id, paymentType: paymentType.CREDIT, deleted: false },
  });

  if (!checkCreditInDB)
    return next(new AppError("Invalid ID. Payment(Credit) not found", 404));

  if (data) {
    if (data.debitType || data.projectId || data.paymentType) {
      return res.status(200).json({
        status: "fail",
        message: "You can not upate the credit",
      });
    }
    if (data.paymentHeadId) {
      let checkPaymentHeadInDB = await Models.PaymentHead.findOne({
        where: { id: data.paymentHeadId, deleted: false },
      });

      if (!checkPaymentHeadInDB)
        return next(new AppError("Invalid ID. Payment Head not found", 404));
    }
    console.log(checkCreditInDB);
    let [, [credit]] = await Models.Payment.update(data, {
      where: { id: id, paymentType: paymentType.CREDIT, deleted: false },
      returning: true,
    });

    credit = Helpers.convertToPlainJSObject(credit);

    return res.status(200).json({
      status: "success",
      message: "Credit updated successfully",
      data: {
        credit,
      },
    });
  }

  return res.status(200).json({
    status: "fail",
    message: "No Data is given to update the Credit",
  });
});

module.exports.updateDebit = CatchAsync(async (req, res, next) => {
  const { data } = req.body;
  const { id } = req.params;

  let checkDebitInDB = await Models.Payment.findOne({
    where: { id: id, paymentType: paymentType.DEBIT, deleted: false },
  });

  if (!checkDebitInDB)
    return next(new AppError("Invalid ID. Payment(Debit) not found", 404));

  if (data) {
    if (data.paymentHeadId || data.paymentType) {
      return res.status(200).json({
        status: "fail",
        message: "You can not upate the debit",
      });
    }
    if (data.projectId) {
      let checkProjectInDB = await Models.Project.findOne({
        where: { id: data.projectId, deleted: false },
      });

      if (!checkProjectInDB)
        return next(new AppError("Invalid ID. Project not found", 404));
    }
    let [, [debit]] = await Models.Payment.update(data, {
      where: { id: id, paymentType: paymentType.DEBIT, deleted: false },
      returning: true,
    });

    debit = Helpers.convertToPlainJSObject(debit);

    return res.status(200).json({
      status: "success",
      message: "Debit updated successfully",
      data: {
        debit,
      },
    });
  }

  return res.status(200).json({
    status: "fail",
    message: "No Data is given to update the Debit",
  });
});

module.exports.deletePayment = CatchAsync(async (req, res, next) => {
  const { id } = req.params;

  let checkDebitInDB = await Models.Payment.findOne({
    where: { id: id, deleted: false },
  });

  if (!checkDebitInDB)
    return next(new AppError("Invalid ID. Payment not found", 404));

  let [, [debit]] = await Models.Payment.update(
    { deleted: true },
    {
      where: { id: id, deleted: false },
      returning: true,
    }
  );

  return res.status(200).json({
    status: "success",
    message: "Payment is Deleted ",
    data: { PaymentId: id },
  });
});
