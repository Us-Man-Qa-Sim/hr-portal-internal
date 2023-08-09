var pdf = require("pdf-creator-node");
var fs = require("fs");
const moment = require("moment");
var converter = require("number-to-words");

module.exports.createPDF = async (
  user,
  salary,
  deductionIncentives,
  earningIncentives,
  totalEarn,
  totalDeduction,
  lop,
  fileName
) => {
  var html = fs.readFileSync(`${__dirname}/paySlip.html`, "utf8");

  var options = {
    format: "A3",
    orientation: "portrait",
    border: "10mm",
  };

  let date = new Date();
  let month = date.toLocaleString("en-us", { month: "long" });
  var document = {
    html: html,
    data: {
      userName: user.name,
      JoiningDate: moment(user.joiningDate).format("Do MMMM YYYY"),
      userdesignation: user.designation.title,
      total: parseInt(salary.netSalary) - parseInt(lop),
      deductionIncentives,
      earningIncentives,
      totalEarn,
      totalDeduction,
      words: converter.toWords(parseInt(salary.netSalary) - parseInt(lop)),
      month,
      year: new Date().getFullYear(),
    },
    path: fileName ? `./${fileName}.pdf` : "./invoice.pdf",
    type: "",
  };

  await pdf.create(document, options);

  return;
};
