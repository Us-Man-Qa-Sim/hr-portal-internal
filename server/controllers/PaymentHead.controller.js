const Models = require("../models");
const AppError = require("../utils/AppError");
const CatchAsync = require("../utils/CatchAsync");
const Helpers = require("../utils/Helpers");
const Paginate = require("../utils/Paginate");

module.exports.addPaymentHead = CatchAsync(async (req, res, next) => {
  const { title } = req.body.data;

  let paymentHead = await Models.PaymentHead.create({
    title: title,
  });

  paymentHead = Helpers.convertToPlainJSObject(paymentHead);

  return res.status(200).json({
    status: "success",
    message: "payment Head added successfully",
    data: {
      paymentHead,
    },
  });
});

module.exports.deletePaymentHead = CatchAsync(async (req, res, next) => {
  const { id } = req.params;

  const checkPaymentHeadInDB = await Models.PaymentHead.findOne({
    where: { id },
  });
  if (!checkPaymentHeadInDB)
    return next(new AppError("Invalid ID. Payment Head not found", 404));

  const checkDeletedPaymentHeadInDB = await Models.PaymentHead.findOne({
    where: { id, deleted: true },
  });
  if (checkDeletedPaymentHeadInDB)
    return next(
      new AppError("Invalid ID. Invalid ID. Payment Head not found", 404)
    );

  let [, [paymentHead]] = await Models.PaymentHead.update(
    { deleted: true },
    { where: { id }, returning: true }
  );
  return res.status(200).json({
    status: "success",
    message: "Payment Head deleted successfully",
    data: {
      PaymentHeadId: id,
    },
  });
});

module.exports.getPaymentHeads = CatchAsync(async (req, res, next) => {
  const { query } = req;

  const pagination = await Paginate(
    Models.PaymentHead,
    {},
    query.page,
    query.limit
  );

  let paymentHead = await Models.PaymentHead.findAll({
    order: [["createdAt", "desc"]],
    limit: pagination.limit,
    offset: pagination.offset,
    where: {
      deleted: false,
    },
    attributes: { exclude: ["deleted"] },
  });

  return res.status(200).json({
    status: "success",
    message: "All Payment Heads fecthed successfully",
    data: {
      paymentHead,
      pagination,
    },
  });
});

module.exports.updatePaymentHead = CatchAsync(async (req, res, next) => {
  const { id } = req.params;

  const checkPaymentHeadInDB = await Models.PaymentHead.findOne({
    where: { id },
  });
  if (!checkPaymentHeadInDB)
    return next(new AppError("Invalid ID. payment Head not found", 404));

  const checkDeletedPaymentHeadInDB = await Models.PaymentHead.findOne({
    where: { id, deleted: true },
  });

  if (checkDeletedPaymentHeadInDB)
    return next(
      new AppError("Invalid ID. Invalid ID. Payment Head not found", 404)
    );

  if (req.body.data) {
    let [, [paymentHead]] = await Models.PaymentHead.update(
      { ...req.body.data },
      {
        where: { id, deleted: false },
        returning: true,
      }
    );

    paymentHead = Helpers.convertToPlainJSObject(paymentHead);

    return res.status(200).json({
      status: "success",
      message: "payment Head updated successfully",
      data: {
        paymentHead,
      },
    });
  }
  return res.status(200).json({
    status: "fail",
    message: "No data is given to update the Payment Head",
  });
});
