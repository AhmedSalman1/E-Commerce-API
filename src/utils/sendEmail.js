import nodemailer from 'nodemailer';
import mg from 'nodemailer-mailgun-transport';

export const sendEmail = async (options) => {
  // 1) Create a transporter (service that sends the email)
  const mailgunAuth = {
    auth: {
      api_key: process.env.MAILGUN_API_KEY,
      domain: process.env.MAILGUN_DOMAIN,
    },
  };

  const transporter = nodemailer.createTransport(mg(mailgunAuth));

  // 2) Define the email options
  const mailOptions = {
    from: 'Nestify App <medoaliaa7@gmail.com>',
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  // 3) Actually send the email
  await transporter.sendMail(mailOptions);
};
