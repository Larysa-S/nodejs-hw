import bcrypt from 'bcrypt';
import createHttpError from 'http-errors';
import { User } from '../models/user.js';
import { Session } from '../models/session.js';
import { createSession, setSessionCookies } from '../services/auth.js';

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
