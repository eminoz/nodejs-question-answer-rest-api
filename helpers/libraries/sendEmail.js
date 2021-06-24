const nodemailer = require("nodemailer");

const sendEmail = async (mailOptions) => {
  let transporter = nodemailer.createTransport({
    host: process.env.SMPT_HOST,
    port: process.env.SMPT_PORT,
    auth: {
      user: process.env.SMPT_USER,
      pass: process.env.SMPT_PASS,
    },
  });
  let info = await transporter.sendMail(mailOptions);
  console.log(`Message Sent:${info.messageId}`);
};
module.exports = sendEmail;
