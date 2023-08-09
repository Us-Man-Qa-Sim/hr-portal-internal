const nodemailer = require("nodemailer");

//let transport = nodemailer.createTransport(options, [defaults]);
module.exports.email = (users) => {
  let transport = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMI_USERNAME,
      pass: process.env.EMI_PASSWORD,
    },
  });

  let mailOptions = {};
  users.map((user) => {
    mailOptions = {
      from: process.env.EMI_USERNAME,
      to: user.to,
      subject: user.subject,
      html: user.html,
      attachments: user.attachments,
    };

    transport.sendMail(mailOptions, function (err, info) {
      if (err) {
        console.log(err);
      } else {
        console.log(info);
      }
    });
  });
};
