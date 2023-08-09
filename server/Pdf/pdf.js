var pdf = require("pdf-creator-node");
var fs = require("fs");
const moment = require("moment");

module.exports.createPDF = async (
  invoice,
  invoiceItems,
  amountData,
  client,
  fileName
) => {
  var html = fs.readFileSync(`${__dirname}/index.html`, "utf8");

  var options = {
    format: "A3",
    orientation: "portrait",
    border: "10mm",
  };

  invoiceItems.map((item, index) => {
    item["id"] = index + 1;
  });

  console.log(fileName);
  var document = {
    html: html,
    data: {
      tax: amountData.tax,
      discount: amountData.discount,
      subtotal: amountData.subtotal,
      invoiceItems,
      taxPercentage: invoice.tax,
      discontPercentage: invoice.discount,
      total: invoice.total,
      otherInformation: invoice.otherInformation,
      date: moment(invoice.invoiceDate).format("Do MMMM YYYY"),
      duDate: moment(invoice.expiryDate).format("Do MMMM YYYY"),
      clientName: client.name,
      clientEmail: client.email,
      clientAddress: client.address,
      clientCompany: client.company,
      clientContact: client.contactNumber,
    },
    path: fileName ? `./${fileName}.pdf` : "./invoice.pdf",
    type: "",
  };

  await pdf.create(document, options);
  // pdf
  //   .create(document, options)
  //   .then((res) => {
  //     console.log(res);
  //   })
  //   .catch((error) => {
  //     console.error(error);
  //   });

  // return;
};
