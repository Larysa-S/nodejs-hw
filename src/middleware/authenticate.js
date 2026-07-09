import createHttpError from 'http-errors';
import { Session } from '../models/session.js';
import { User } from '../models/user.js';

export const authenticate = async (req, res, next) => {
  try {
    // 1. Беруться ОБИДВІ куки: accessToken та sessionId
    const { accessToken, sessionId } = req.cookies;

    // ВИПРАВЛЕНО: Перевіряємо наявність обох кукі
    if (!accessToken || !sessionId) {
      throw createHttpError(401, 'Missing access token');
    }

    // 2. Шукаємо у базі даних сесію за ДВОМА критеріями одночасно за ТЗ
    const session = await Session.findOne({
      _id: sessionId,
      accessToken,
    });

    if (!session) {
      throw createHttpError(401, 'Session not found');
    }

    // 3. Перевіряємо, чи не прострочений access-токен
    const isTokenExpired = new Date() > new Date(session.accessTokenValidUntil);
    if (isTokenExpired) {
      throw createHttpError(401, 'Access token expired');
    }

    // 4. Шукаємо користувача (модель 'User' з великої літери)
    const user = await User.findById(session.userId);

    if (!user) {
      throw createHttpError(401); // 401 без повідомлення за ТЗ
    }

    // 5. Зберігаємо користувача в req.user та передаємо керування далі
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};
