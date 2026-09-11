import nodemailer from "nodemailer";
import { MailtrapTransport } from "mailtrap";
import AppError from "./AppError.js";

export const sendEmail = async ({ to, subject, text, html }) => {
  const { MAILTRAP_TOKEN, MAIL_FROM, MAIL_FROM_NAME } = process.env;
  if (!MAILTRAP_TOKEN || !MAIL_FROM) {
    throw new AppError("Email delivery is not configured. Set MAILTRAP_TOKEN and MAIL_FROM on the server.", 503);
  }

  // Mailtrap's API transport authenticates with an API token instead of SMTP host/user/password.
  const transporter = nodemailer.createTransport(MailtrapTransport({ token: MAILTRAP_TOKEN }));
  const sender = { address: MAIL_FROM, name: MAIL_FROM_NAME || "E-Commerce API" };
  await transporter.sendMail({ from: sender, to, subject, text, html });
};
