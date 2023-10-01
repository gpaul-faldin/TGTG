import nodemailer, {Transporter} from "nodemailer";
import { base64ToText } from "@utils/base64ToText";

var TRANSPORTER: Transporter | null = null;

const initTransporter = () => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORDB64) {
    throw new Error("Missing environment variables for smtp");
  };
  TRANSPORTER = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.SMTP_USER,
      pass: base64ToText(String(process.env.SMTP_PASSWORDB64)),
    },
  });

  TRANSPORTER.verify(function (error, success) {
    if (error) {
      console.log(error);
      return null
    } else {
      console.log("SMTP Server is ready");
    }
  });
}

const sendEmailCVV = async (To: string, link: string) => {

  if (TRANSPORTER === null) {
    initTransporter();
  }
  if (TRANSPORTER !== null) {

    let info = await TRANSPORTER.sendMail({
      from: process.env.ADMIN_EMAIL,
      to: To,
      subject: "Validate your TooGoodToBot order",
      html: `
    <html>
      <head>
        <meta charset="UTF-8">
        <title>Transaction Validation</title>
      </head>
      <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 20px; box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);">
            <h2 style="color: #333;">Transaction Validation</h2>
            <p>Hello,</p>
            <p>Please click on the link below to validate your transaction:</p>
            <a href="${link}" style="display: inline-block; background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">Validate Transaction</a>
            <p>If the link above doesn't work, you can copy and paste the following URL into your browser:</p>
            <p><code>${link}</code></p>
            <p>After clicking the link, you will be asked to enter the CVV of your saved payment method on Too Good To Go</p>
            <p>Once you have entered the CVV, your order will be validated and you will receive a confirmation email from Too Good To Go.</p>
            <p>Since we do not have the right to save any of your credit card information, this process cannot be fully automatic</p>
            <p>If you did not initiate this transaction or have any concerns, please ignore this email.</p>
            <p>Thank you!</p>
          </div>
      </body>
    </html>
`,
    });

    return info;
  }

  return null

};

const sendEmailWelcome = async (To: string) => {

  if (TRANSPORTER === null) {
    initTransporter();
  }
  if (TRANSPORTER !== null) {

    let info = await TRANSPORTER.sendMail({
      from: process.env.ADMIN_EMAIL,
      to: To,
      subject: "Validate your TooGoodToBot order",
      html: `
<html>
  <head>
    <meta charset="UTF-8">
    <title>Welcome to Too Good To Bot!</title>
  </head>
  <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px;">
    <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 20px; box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);">
        <h2 style="color: #333;">Welcome to Too Good To Bot!</h2>
        <p>Hello,</p>
        <p>Thank you for registering on Too Good To Bot. We are thrilled to have you on board!</p>
        <p>We appreciate your trust in us. If you have any questions or need assistance, feel free to reach out.</p>
        <p>Thank you once again for choosing Too Good To Bot. We look forward to serving you!</p>
        <p>Best regards,</p>
        <p>The Too Good To Bot Team</p>
      </div>
  </body>
</html>

`,
    });

    return info;
  }

  return null

};

export { sendEmailCVV, sendEmailWelcome };