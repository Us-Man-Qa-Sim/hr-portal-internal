const Models = require("../models");
const AppError = require("../utils/AppError");
let moment = require("moment");
var fs = require("fs");
const { email } = require("../email/sendEmail");

module.exports.sendInvoiceEmail = async (invoice, project, loggedUser) => {
  let client = await Models.User.findOne({ where: { id: invoice.clientId } });

  let user = [];

  let html = `<b>Dear <strong>${
    client.name
  }</strong>,</b> <br> <p>Invoice of <b>$${
    invoice.total
  }</b> created in project <b>${project.title}</b> with tax ${
    invoice.tax
  }% and discount ${invoice.discount}%. Expiry date of the invoice is ${moment(
    invoice.expiryDate
  ).format("Do MMMM YYYY")}.<br><br>
  Thanks and Regards <br>
  <strong>${loggedUser.name}</strong>
  </p>`;
  let data = undefined;
  let data1 = fs.readFileSync("./invoice.pdf");

  data = {
    to: "shahrukh.namal@gmail.com",
    subject: `${project.title} Invoice`,
    html,
    attachments: [{ filename: "invoice.pdf", content: data1 }],
  };

  console.log(data);
  user.push(data);
  email(user);
};

module.exports.calculateInvoiceInfo = async (id) => {
  let checkInvoiceInDB = await Models.Invoice.findOne({ where: { id } });

  if (!checkInvoiceInDB)
    return next(new AppError("Invalid ID, Invoice not found", 404));

  let invoice = await Models.Invoice.findOne({
    where: { id },
    include: [
      {
        model: Models.User,
        attributes: ["name", "email", "company", "address", "contactNumber"],
      },
      { model: Models.Project, attributes: ["title", "progress"] },
      { model: Models.InvoiceItem },
    ],
    order: [["createdAt", "desc"]],
  });

  invoice = JSON.parse(JSON.stringify(invoice));

  let { invoiceItems, tax, discount } = invoice;

  let subtotal = 0;
  invoiceItems.map((item) => {
    subtotal += parseInt(item.amount);
  });
  let taxAmount = tax ? Math.round((parseInt(tax) / 100) * subtotal) : 0;
  let discountAmount = discount
    ? Math.round((parseInt(discount) / 100) * subtotal)
    : 0;

  invoice["subtotal"] = subtotal;
  invoice["taxAmount"] = taxAmount;
  invoice["discountAmount"] = discountAmount;

  return invoice;
};
