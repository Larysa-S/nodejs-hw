import createHttpError from 'http-errors';
import { Session } from '../models/session.js';
import { User } from '../models/user.js';

export const authenticate = async (req, res, next) => {
  try {
    // 1. Перевіряємо наявність кукі accessToken
    const { accessToken } = req.cookies;

    if (!accessToken) {
      throw createHttpError(401, 'Missing access token');
    }

    // 2. Шукаємо у базі даних сесію за цим токеном
    const session = await Session.findOne({ accessToken });

    if (!session) {
      throw createHttpError(401, 'Session not found');
    }

    // 3. Перевіряємо, чи не прострочений access-токен
    const isTokenExpired = new Date() > new Date(session.accessTokenValidUntil);
    if (isTokenExpired) {
      throw createHttpError(401, 'Access token expired');
    }

    // 4. Шукаємо користувача, пов’язаного з цією сесією
    const user = await User.findById(session.userId);

    if (!user) {
      throw createHttpError(401); // 401 статус без повідомлення за ТЗ
    }

    // 5. У разі успіху зберігаємо користувача в req.user та йдемо далі
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};
