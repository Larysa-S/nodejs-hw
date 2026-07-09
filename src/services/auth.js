import crypto from 'crypto';
import { Session } from '../models/session.js';
import { FIFTEEN_MINUTES, ONE_DAY } from '../constants/time.js';

// Функція 1: Створення сесії в базі даних
export const createSession = async (userId) => {
  // Видаляємо старі сесії користувача перед створенням нової (опціонально, для чистоти БД)
  await Session.deleteOne({ userId });

  const accessToken = crypto.randomBytes(30).toString('base64');
  const refreshToken = crypto.randomBytes(30).toString('base64');

  const accessTokenValidUntil = new Date(Date.now() + FIFTEEN_MINUTES);
  const refreshTokenValidUntil = new Date(Date.now() + ONE_DAY);

  return await Session.create({
    userId,
    accessToken,
    refreshToken,
    accessTokenValidUntil,
    refreshTokenValidUntil,
  });
};

// Функція 2: Встановлення кукі у відповідь сервера
export const setSessionCookies = (res, session) => {
  // Спільні базові налаштування безпеки для всіх кукі
  const baseCookieOptions = {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
  };

  // Кука для Access Token (15 хвилин)
  res.cookie('accessToken', session.accessToken, {
    ...baseCookieOptions,
    maxAge: FIFTEEN_MINUTES,
  });

  // Кука для Refresh Token (1 день)
  res.cookie('refreshToken', session.refreshToken, {
    ...baseCookieOptions,
    maxAge: ONE_DAY,
  });

  // Кука для ID Сесії (1 день)
  res.cookie('sessionId', session._id.toString(), {
    ...baseCookieOptions,
    maxAge: ONE_DAY,
  });
};
