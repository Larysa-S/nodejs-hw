import { Router } from 'express';
import { celebrate, Segments } from 'celebrate';
import {
  registerUser,
  loginUser,
  refreshUserSession,
  logoutUser,
  requestResetEmail,
  resetPassword,
} from '../controllers/authController.js';
import {
  registerUserSchema,
  loginUserSchema,
  requestResetEmailSchema,
  resetPasswordSchema,
} from '../validations/authValidation.js';

const authRouter = Router();

// Маршрут реєстрації
authRouter.post(
  '/auth/register',
  celebrate({
    [Segments.BODY]: registerUserSchema,
  }),
  registerUser,
);

// Маршрут логіну
authRouter.post(
  '/auth/login',
  celebrate({
    [Segments.BODY]: loginUserSchema,
  }),
  loginUser,
);

// Маршрут оновлення сесії
authRouter.post('/auth/refresh', refreshUserSession);

// Маршрут логауту
authRouter.post('/auth/logout', logoutUser);

// 1. Запит на надсилання листа для скидання паролю (інтегровано з celebrate)
authRouter.post(
  '/auth/request-reset-email',
  celebrate({
    [Segments.BODY]: requestResetEmailSchema,
  }),
  requestResetEmail,
);

// 2. Встановлення нового пароля за допомогою токена (інтегровано з celebrate)
authRouter.post(
  '/auth/reset-password',
  celebrate({
    [Segments.BODY]: resetPasswordSchema,
  }),
  resetPassword,
);

export default authRouter;
