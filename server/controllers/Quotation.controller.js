const Models = require("../models");
const AppError = require("../utils/AppError");
const CatchAsync = require("../utils/CatchAsync");
const Helpers = require("../utils/Helpers");
const Paginate = require("../utils/Paginate");

module.exports.addQuotation = CatchAsync(async (req, res, next) => {
  {
    const {
      projectId,
      clientId,
      tax,
      expiryDate,
      quotationDate,
      items,
      discount,
      otherInformation,
    } = req.body.data;

    let checkProjectInDB = await Models.Project.findOne({
      where: { id: projectId },
    });

    if (!checkProjectInDB)
      return next(new AppError("Invalid ID. Project not found", 404));

    if (clientId !== checkProjectInDB.clientId)
      return next(new AppError("Given client is not client of project", 404));

    let amount = 0;

    items.map((data) => {
      amount += parseInt(data.unitCost) * parseInt(data.quantity);
    });
    let increase = 0;
    let decrease = 0;

    if (tax) increase = Math.round((parseInt(tax) / 100) * amount);

    if (discount) decrease = Math.round((parseInt(discount) / 100) * amount);

    amount = amount + increase - decrease;

    let quotation = await Models.Quotation.create({
      projectId,
      clientId,
      tax: tax ? tax : "0",
      expiryDate,
      quotationDate,
      items,
      total: amount,
      discount: discount ? discount : "0",
      otherInformation,
    });

    let quotationItems = [];

    items.map((data) => {
      quotationItems.push({
        quotationId: quotation.id,
        itemName: data.itemName,
        description: data.description,
        unitCost: data.unitCost,
        quantity: data.quantity,
        amount: Math.round(parseInt(data.unitCost) * parseInt(data.quantity)),
      });
    });
    await Models.QuotationItem.bulkCreate(quotationItems);

    return res.status(201).json({
      status: "success",
      message: "Quotation & QuotationItems are added successfully",
      data: {
        quotation,
      },
    });
  }
});

module.exports.getQuotations = CatchAsync(async (req, res, next) => {
  const { query } = req;

  let whereCaluse = {
    projectId: query.projectId ? query.projectId : undefined,
    clientId: query.clientId ? query.clientId : undefined,
    status: query.status ? query.status : undefined,
  };

  Object.keys(whereCaluse).forEach(
    (key) => whereCaluse[key] === undefined && delete whereCaluse[key]
  );

  const pagination = await Paginate(
    Models.Quotation,
    whereCaluse,
    query.page,
    query.limit
  );

  let quotations = await Models.Quotation.findAll({
    where: whereCaluse,
    include: [
      {
        model: Models.User,
        attributes: ["id", "name", "email", "company", "address"],
      },
      { model: Models.Project, attributes: ["title", "progress"] },
      { model: Models.QuotationItem },
    ],
    order: [["createdAt", "desc"]],
    limit: pagination.limit,
    offset: pagination.offset,
  });

  return res.status(200).json({
    status: "success",
    message: "All Quotations fecthed successfully",
    data: {
      quotations,
      pagination,
    },
  });
});

module.exports.getQuotationInfo = CatchAsync(async (req, res, next) => {
  const { id } = req.params;

  let checkQuotationInDB = await Models.Quotation.findOne({ where: { id } });

  if (!checkQuotationInDB)
    return next(new AppError("Invalid ID, Quotation not found", 404));

  let quotation = await Models.Quotation.findOne({
    where: { id },
    include: [
      {
        model: Models.User,
        attributes: ["name", "email", "company", "address", "contactNumber"],
      },
      { model: Models.Project, attributes: ["title", "progress"] },
      { model: Models.QuotationItem },
    ],
    order: [["createdAt", "desc"]],
  });

  quotation = Helpers.convertToPlainJSObject(quotation);

  let { quotationItems, tax, discount } = quotation;

  let subtotal = 0;
  quotationItems.map((item) => {
    subtotal += parseInt(item.amount);
  });
  let taxAmount = tax ? Math.round((parseInt(tax) / 100) * subtotal) : 0;
  let discountAmount = discount
    ? Math.round((parseInt(discount) / 100) * subtotal)
    : 0;

  quotation["subtotal"] = subtotal;
  quotation["taxAmount"] = taxAmount;
  quotation["discountAmount"] = discountAmount;

  return res.status(200).json({
    status: "success",
    message: "Quotation's details fecthed successfully",
    data: {
      quotation,
    },
  });
});

module.exports.deleteItem = CatchAsync(async (req, res, next) => {
  const { id } = req.params;

  let quotationMessage = `Quotation and his items are deleted successfully`;

  let quotationItemMessage = `Quotation item deleted successfully`;

  let givenIdQuotation = await Models.Quotation.destroy({ where: { id } });

  await Models.QuotationItem.destroy({
    where: { quotationId: id },
  });

  let attchementDelete = await Models.QuotationItem.destroy({ where: { id } });

  console.log(givenIdQuotation, attchementDelete);

  if (givenIdQuotation === 1) {
    return res.status(200).json({
      status: "success",
      message: quotationMessage,
      id,
    });
  }

  if (attchementDelete !== 0) {
    return res.status(200).json({
      status: "success",
      message: quotationItemMessage,
      id,
    });
  }

  return res.status(404).json({
    status: "fail",
    message: "Quotation does not exist",
    id,
  });
});

module.exports.updateQuotation = CatchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { data } = req.body;

  let checkQuotationTnDB = await Models.Quotation.findOne({
    where: { id: id },
    include: [{ model: Models.QuotationItem }],
  });

  if (!checkQuotationTnDB)
    return next(new AppError("Invalid ID. Quotations not found", 404));

  if (!data)
    return next(
      new AppError("Invalid. No data is given to update the Quotations", 404)
    );

  let amount = 0;

  data.items.map((data) => {
    amount += parseInt(data.unitCost) * parseInt(data.quantity);
  });
  let increase = 0;
  let decrease = 0;

  const { tax: prevTax, discount: prevDiscount } = checkQuotationTnDB;

  let tax =
    data.tax && parseInt(prevTax) !== parseInt(data.tax) ? data.tax : prevTax;
  let discount =
    data.discount && parseInt(prevDiscount) !== parseInt(data.discount)
      ? data.discount
      : prevDiscount;

  increase = Math.round((parseInt(tax) / 100) * amount);

  decrease = Math.round((parseInt(discount) / 100) * amount);

  amount = amount + increase - decrease;

  data["total"] = amount;

  let [, [quotation]] = await Models.Quotation.update(
    {
      ...data,
    },
    { where: { id }, returning: true }
  );

  await Models.QuotationItem.destroy({ where: { quotationId: id } });

  let newItems = [];
  data.items.map((data) => {
    newItems.push({
      quotationId: id,
      itemName: data.itemName,
      description: data.description,
      unitCost: data.unitCost,
      quantity: data.quantity,
      amount: Math.round(parseInt(data.unitCost) * parseInt(data.quantity)),
    });
  });

  await Models.QuotationItem.bulkCreate(newItems);

  return res.status(200).json({
    status: "success",
    message: "Quotation is update",
    quotation,
  });
});

module.exports.changeQuotationStatus = CatchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { data } = req.body;
  let checkQuotationInDB = await Models.Quotation.findOne({
    where: { id },
  });

  if (!checkQuotationInDB)
    return next(new AppError("Invalid ID. Quotation not found", 404));

  [, [quotation]] = await Models.Quotation.update(
    {
      status: data.status,
    },
    { where: { id }, returning: true }
  );

  return res.status(200).json({
    status: "success",
    message: "Quotation status changed successfully",
    data: {
      quotation,
    },
  });
});
