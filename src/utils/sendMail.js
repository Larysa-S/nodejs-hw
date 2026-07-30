import nodemailer from 'nodemailer';
import createHttpError from 'http-errors';

const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, SMTP_FROM } =
  process.env;

const nodemailerConfig = {
  host: SMTP_HOST,
  port: Number(SMTP_PORT),
  secure: false, // 587
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASSWORD,
  },
};

const transport = nodemailer.createTransport(nodemailerConfig);

// ВИПРАВЛЕНО: Функція перейменована на sendEmail за вимогою ментора
// ВИПРАВЛЕНО: Поле from обробляється як опціональне покращення (береться з options або з env)
export const sendEmail = async (options) => {
  try {
    const email = {
      from: SMTP_FROM, // значення за замовчуванням
      ...options, // якщо в options є власне поле from, воно перезапише дефолтне
    };

    // ВИПРАВЛЕНО: Функція повертає ФАКТИЧНИЙ результат операції sendMail замість true
    const result = await transport.sendMail(email);
    return result;
  } catch (error) {
    throw createHttpError(
      500,
      'Failed to send the email, please try again later.',
    );
  }
};
