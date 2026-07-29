import nodemailer from 'nodemailer';

const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, SMTP_FROM } =
  process.env;

const nodemailerConfig = {
  host: SMTP_HOST,
  port: Number(SMTP_PORT),
  secure: false, // false для порту 587
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASSWORD,
  },
};

const transport = nodemailer.createTransport(nodemailerConfig);

export const sendMail = async (data) => {
  const email = { ...data, from: SMTP_FROM };
  await transport.sendMail(email);
  return true;
};
