import bcrypt from 'bcrypt';
import createHttpError from 'http-errors';
import { User } from '../models/user.js';
import { Session } from '../models/session.js';
import { createSession, setSessionCookies } from '../services/auth.js';

import jwt from 'jsonwebtoken';
import fs from 'fs/promises';
import path from 'path';
import Handlebars from 'handlebars';
import { sendEmail } from '../utils/sendMail.js';

// 1. Контролер реєстрації користувача
export const registerUser = async (req, res, next) => {
  try {
    const { email, password, username } = req.body;

    // Перевірка, чи існує користувач
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw createHttpError(400, 'Email in use');
    }

    // Хешування пароля
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Створення нового користувача в базі
    const newUser = await User.create({
      email,
      password: hashedPassword,
      username, // pre('save') хук автоматично заповнить його значенням email, якщо поле пусте
    });

    // Створення сесії
    const session = await createSession(newUser._id);

    // Встановлення кукі до відповіді
    setSessionCookies(res, session);

    // Відповідь клієнту (пароль видаляється автоматично завдяки toJSON у схемі)
    res.status(201).json(newUser);
  } catch (error) {
    next(error);
  }
};

// 2. Контролер логіну користувача
export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Шукаємо користувача за email
    const user = await User.findOne({ email });
    if (!user) {
      throw createHttpError(401, 'Invalid credentials');
    }

    // Перевіряємо пароль за допомогою bcrypt
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      throw createHttpError(401, 'Invalid credentials');
    }

    // Видаляємо стару сесію цього користувача
    await Session.deleteOne({ userId: user._id });

    // Створюємо нову сесію
    const session = await createSession(user._id);

    // Додаємо кукі до відповіді
    setSessionCookies(res, session);

    // Повертаємо користувача (пароль видаляється автоматично через toJSON у схемі)
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

// 3. Контролер оновлення сесії
export const refreshUserSession = async (req, res, next) => {
  try {
    // 1. Беруться sessionId та refreshToken з cookies
    const { sessionId, refreshToken } = req.cookies;

    // Якщо кукі взагалі відсутні в запиті
    if (!sessionId || !refreshToken) {
      throw createHttpError(401, 'Session not found');
    }

    // 2. Шукаємо сесію у базі даних
    const session = await Session.findOne({
      _id: sessionId,
      refreshToken,
    });

    // Якщо сесію не знайдено
    if (!session) {
      throw createHttpError(401, 'Session not found');
    }

    // Спільні базові налаштування безпеки для очищення кукі
    const baseCookieOptions = {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
    };

    // 3. Перевіряємо, чи не прострочений refresh-токен
    const isTokenExpired =
      new Date() > new Date(session.refreshTokenValidUntil);

    // ВИПРАВЛЕНО: Якщо токен прострочений, спочатку чистимо БД та кукі, а потім кидаємо 401
    if (isTokenExpired) {
      // Видаляємо прострочену сесію з бази даних
      await Session.deleteOne({ _id: sessionId });

      // Очищаємо cookies на стороні клієнта
      res.clearCookie('accessToken', baseCookieOptions);
      res.clearCookie('refreshToken', baseCookieOptions);
      res.clearCookie('sessionId', baseCookieOptions);

      // Кидаємо помилку 401 за ТЗ
      throw createHttpError(401, 'Session token expired');
    }

    // Зберігаємо userId перед видаленням сесії, щоб створити нову
    const userId = session.userId;

    // 4. Видаляємо стару дійсну сесію з бази для її оновлення
    await Session.deleteOne({ _id: sessionId });

    // 5. Створюємо нову сесію та додаємо нові кукі до відповіді
    const newSession = await createSession(userId);
    setSessionCookies(res, newSession);

    // 6. Повертаємо успішну відповідь за ТЗ
    res.status(200).json({
      message: 'Session refreshed',
    });
  } catch (error) {
    next(error);
  }
};

// 4. Контролер логауту користувача
export const logoutUser = async (req, res, next) => {
  try {
    const { sessionId } = req.cookies;

    // Якщо є у cookies sessionId — видаляємо відповідну сесію з бази даних
    if (sessionId) {
      await Session.deleteOne({ _id: sessionId });
    }

    // Очищаємо cookies на стороні клієнта за допомогою тих самих налаштувань безпеки
    const baseCookieOptions = {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
    };

    res.clearCookie('accessToken', baseCookieOptions);
    res.clearCookie('refreshToken', baseCookieOptions);
    res.clearCookie('sessionId', baseCookieOptions);

    // Повертаємо відповідь зі статусом 204 (без тіла)
    res.status(204).end();
  } catch (error) {
    next(error);
  }
};

// 5. Контролер запиту на надсилання листа для скидання паролю (за ТЗ)
export const requestResetEmail = async (req, res, next) => {
  try {
    const { email } = req.body;

    // Шукаємо користувача за email
    const user = await User.findOne({ email });

    // Якщо користувача НЕ знайдено — повертаємо 200 за ТЗ з міркувань безпеки
    if (!user) {
      return res
        .status(200)
        .json({ message: 'Password reset email sent successfully' });
    }

    // Згенеруйте JWT-токен, який містить sub (id користувача) та email. Термін життя — 15 хвилин.
    const resetToken = jwt.sign(
      {
        sub: user._id,
        email: user.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: '15m' },
    );

    // Зберігаємо токен у базі у користувача
    user.resetToken = resetToken;
    await user.save();

    // Посилання на фронтенд за ТЗ
    const resetUrl = `${process.env.FRONTEND_DOMAIN}/reset-password?token=${resetToken}`;

    // Читаємо та компилюємо HTML-лист за допомогою handlebars
    const templatePath = path.resolve(
      'src',
      'templates',
      'reset-password-email.html',
    );
    const templateSource = await fs.readFile(templatePath, 'utf-8');
    const template = Handlebars.compile(templateSource);

    // Передаємо дані в шаблон
    const htmlTemplate = template({
      name: user.username || user.email,
      resetUrl: resetUrl,
    });

    // ВИПРАВЛЕНО: Окремий try/catch для відправки листа, щоб явно перетворити помилку на HTTP 500
    try {
      // ВИПРАВЛЕНО: Імпорт та використання відповідають назві функції sendEmail
      // ВИПРАВЛЕНО: Адреса from з process.env.SMTP_FROM явно включена в опції за ТЗ
      await sendEmail({
        from: process.env.SMTP_FROM,
        to: email,
        subject: 'Password Reset Request',
        html: htmlTemplate,
      });
    } catch (mailError) {
      // ВИПРАВЛЕНО: Помилка перетворюється на HTTP-помилку 500 за допомогою http-errors
      throw createHttpError(
        500,
        'Failed to send the email, please try again later.',
      );
    }

    // У разі успіху повертаємо відповідь зі статусом 200
    res.status(200).json({ message: 'Password reset email sent successfully' });
  } catch (error) {
    next(error);
  }
};

// 6. Контролер самого скидання паролю (стовідсотково за ТЗ)
export const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;

    let decoded;

    // Верифікуємо отриманий в тілі запиту jwt-токен
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      // Якщо токен невалідний або прострочений
      throw createHttpError(401, 'Invalid or expired token');
    }

    // Знайдіть користувача за sub та email, які містяться в токені
    const user = await User.findOne({
      _id: decoded.sub,
      email: decoded.email,
      resetToken: token, // перевіряємо, чи цей токен ще записаний у базі
    });

    // Якщо користувача не знайдено
    if (!user) {
      throw createHttpError(404, 'User not found');
    }

    // Зашифруйте новий пароль за допомогою бібліотеки bcrypt
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Оновіть пароль користувача в базі даних та анулюйте токен
    user.password = hashedPassword;
    user.resetToken = null;
    await user.save();

    // У разі успіху поверніть відповідь зі статусом 200
    res.status(200).json({ message: 'Password reset successfully' });
  } catch (error) {
    next(error);
  }
};
