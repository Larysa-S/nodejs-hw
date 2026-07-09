import { Router } from 'express';
import { celebrate, Segments } from 'celebrate';
import {
  registerUser,
  loginUser,
  refreshUserSession,
  logoutUser,
} from '../controllers/authController.js';
import {
  registerUserSchema,
  loginUserSchema,
} from '../validations/authValidation.js';

const authRouter = Router();

// Маршрут реєстрації
authRouter.post(
  '/register',
  celebrate({
    [Segments.BODY]: registerUserSchema,
  }),
  registerUser,
);

// Маршрут логіну
authRouter.post(
  '/login',
  celebrate({
    [Segments.BODY]: loginUserSchema,
  }),
  loginUser,
);

// Маршрут оновлення сесії
authRouter.post('/refresh', refreshUserSession);

// Маршрут логауту
authRouter.post('/logout', logoutUser);

export default authRouter;
