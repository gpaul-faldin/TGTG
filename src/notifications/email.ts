import nodemailer, {Transporter} from "nodemailer";
import { base64ToText } from "../utils/base64ToText";

var TRANSPORTER: Transporter | null = null;

const initTransporter = () => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORDB64) {
    throw new Error("Missing environment variables for smtp");
  };
  TRANSPORTER = nodemailer.createTransport({
    port: 587, // Make sure process.env.SMTP_PORT is correctly set
    host: "smtp-mail.outlook.com",
    secure: false,
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

const sendEmail = async (To: string, link: string) => {

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
            <p>After clicking the link, you will be asked to enter your transaction validation code:</p>
            <form action="${link}" method="post">
              <label for="validationCode">Validation Code:</label>
              <input type="text" id="validationCode" name="validationCode" placeholder="Enter your validation code" style="width: 100%; padding: 10px; margin-bottom: 10px; border: 1px solid #ccc; border-radius: 4px;">
              <button type="submit" style="background-color: #007bff; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer;">Submit</button>
            </form>
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

export {sendEmail};