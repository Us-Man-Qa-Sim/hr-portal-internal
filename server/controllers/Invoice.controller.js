const Models = require("../models");
const AppError = require("../utils/AppError");
const CatchAsync = require("../utils/CatchAsync");
const Helpers = require("../utils/Helpers");
const Services = require("../Services/Invoice.service");
const Paginate = require("../utils/Paginate");
const { createPDF } = require("../Pdf/pdf");
var fs = require("fs");

module.exports.addInvoice = CatchAsync(async (req, res, next) => {
  {
    const {
      projectId,
      clientId,
      tax,
      expiryDate,
      invoiceDate,
      items,
      discount,
      otherInformation,
    } = req.body.data;

    const { user } = req;

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
    let taxAmount = 0;
    let discountAmount = 0;

    if (tax) taxAmount = Math.round((parseInt(tax) / 100) * amount);

    if (discount)
      discountAmount = Math.round((parseInt(discount) / 100) * amount);

    let amountData = {
      tax: taxAmount,
      discount: discountAmount,
      subtotal: amount,
    };
    amount = amount + taxAmount - discountAmount;

    let invoice = await Models.Invoice.create({
      projectId,
      clientId,
      tax: tax ? tax : "0",
      expiryDate,
      invoiceDate,
      items,
      total: amount,
      discount: discount ? discount : "0",
      otherInformation,
    });

    let invoiceItems = [];

    items.map((data) => {
      invoiceItems.push({
        invoiceId: invoice.id,
        itemName: data.itemName,
        description: data.description,
        unitCost: data.unitCost,
        quantity: data.quantity,
        amount: Math.round(parseInt(data.unitCost) * parseInt(data.quantity)),
      });
    });

    await Models.InvoiceItem.bulkCreate(invoiceItems);
    let client = await Models.User.findOne({ where: { id: invoice.clientId } });

    await createPDF(invoice, invoiceItems, amountData, client);
    await Services.sendInvoiceEmail(invoice, checkProjectInDB, user);
    return res.status(201).json({
      status: "success",
      message: "Invoice & InvoiceItems are added successfully",
      data: {
        invoice,
      },
    });
  }
});

module.exports.getInvoices = CatchAsync(async (req, res, next) => {
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
    Models.Invoice,
    whereCaluse,
    query.page,
    query.limit
  );

  let invoices = await Models.Invoice.findAll({
    where: whereCaluse,
    include: [
      {
        model: Models.User,
        attributes: ["id", "name", "email", "company", "address"],
      },
      { model: Models.Project, attributes: ["title", "progress"] },
      { model: Models.InvoiceItem },
    ],
    order: [["createdAt", "desc"]],
    limit: pagination.limit,
    offset: pagination.offset,
  });

  return res.status(200).json({
    status: "success",
    message: "All Invoices fecthed successfully",
    data: {
      invoices,
      pagination,
    },
  });
});

module.exports.getInvoiceInfo = CatchAsync(async (req, res, next) => {
  const { id } = req.params;

  let invoice = await Services.calculateInvoiceInfo(id);

  return res.status(200).json({
    status: "success",
    message: "Invoice's details fecthed successfully",
    data: {
      invoice,
    },
  });
});

module.exports.getInvoicePDF = CatchAsync(async (req, res, next) => {
  const { id } = req.params;

  let invoice = await Services.calculateInvoiceInfo(id);

  let amountData = {
    tax: invoice.taxAmount,
    discount: invoice.discountAmount,
    subtotal: invoice.subtotal,
  };
  let client = await Models.User.findOne({ where: { id: invoice.clientId } });

  let fileName = `${invoice.project.title} Invoice`;
  await createPDF(invoice, invoice.invoiceItems, amountData, client, fileName);
  // var file = fs.createReadStream(`${fileName}.pdf`);
  var stat = fs.statSync(`${fileName}.pdf`);
  res.setHeader("Content-Length", stat.size);
  // res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    `Content-Disposition`,
    `"attachment; filename=${fileName}.pdf"`
  );
  // console.log(file);
  // file.pipe(res);
  var data = fs.readFileSync(`${fileName}.pdf`);
  res.contentType("application/pdf");
  res.send(data);
});

module.exports.deleteItem = CatchAsync(async (req, res, next) => {
  const { id } = req.params;
  let invoiceMessage = `Invoice and his items are deleted successfully`;

  let givenIdInvoice = await Models.Invoice.destroy({ where: { id } });

  await Models.QuotationItem.destroy({
    where: { quotationId: id },
  });

  if (givenIdInvoice === 1)
    return res.status(200).json({
      status: "success",
      message: invoiceMessage,
      id,
    });

  return res.status(404).json({
    status: "fail",
    message: "Quotation or quotation'attachment does not exist",
    id,
  });
});

module.exports.updateInvoice = CatchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { data } = req.body;

  let checkInvoiceInDB = await Models.Invoice.findOne({
    where: { id: id },
    include: [{ model: Models.InvoiceItem }],
  });

  if (!checkInvoiceInDB)
    return next(new AppError("Invalid ID. Invoice not found", 404));

  if (!data)
    return next(
      new AppError("Invalid. No data is given to update the Invoice", 404)
    );

  let amount = 0;

  data.items.map((data) => {
    amount += parseInt(data.unitCost) * parseInt(data.quantity);
  });

  let taxAmount = 0;
  let discountAmount = 0;

  if (data.tax) taxAmount = Math.round((parseInt(data.tax) / 100) * amount);

  if (data.discount)
    discountAmount = Math.round((parseInt(data.discount) / 100) * amount);

  amount = amount + taxAmount - discountAmount;

  data["total"] = amount;

  let [, [invoice]] = await Models.Invoice.update(
    {
      ...data,
    },
    { where: { id }, returning: true }
  );

  await Models.InvoiceItem.destroy({ where: { invoiceId: id } });

  let newItems = [];
  data.items.map((data) => {
    newItems.push({
      invoiceId: id,
      itemName: data.itemName,
      description: data.description,
      unitCost: data.unitCost,
      quantity: data.quantity,
      amount: Math.round(parseInt(data.unitCost) * parseInt(data.quantity)),
    });
  });

  await Models.InvoiceItem.bulkCreate(newItems);

  return res.status(200).json({
    status: "success",
    message: "Invoice is updated successfully",
    invoice,
  });
});

module.exports.changeInvoiceStatus = CatchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { data } = req.body;
  let checkInvoiceInDB = await Models.Invoice.findOne({
    where: { id },
  });

  if (!checkInvoiceInDB)
    return next(new AppError("Invalid ID. Invoice not found", 404));

  [, [invoice]] = await Models.Invoice.update(
    {
      status: data.status,
    },
    { where: { id }, returning: true }
  );

  return res.status(200).json({
    status: "success",
    message: "Invoice status changed successfully",
    data: {
      invoice,
    },
  });
});
