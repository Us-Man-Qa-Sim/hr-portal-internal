const nodemailer = require("nodemailer");

module.exports.email = async (user) => {
  let transport = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMI_USERNAME,
      pass: process.env.EMI_PASSWORD,
    },
  });

  let mailOptions = {
    from: process.env.EMI_USERNAME,
    to: user.to,
    subject: user.subject,
    html: user.html,
    attachments: user.attachments,
  };
  try {
    await transport.sendMail(mailOptions);
    console.log(`Email send to ${user.to}`);
  } catch (error) {
    console.log(error);
  }
};
