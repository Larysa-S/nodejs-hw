import Joi from 'joi';

// 1. Схема для реєстрації користувача
// ВИПРАВЛЕНО: Прибрано поле username за вимогою ментора для суворої валідації
export const registerUserSchema = Joi.object({
  email: Joi.string().email().required().trim().messages({
    'string.email': 'Email must be a valid email address',
    'any.required': 'Email is required',
  }),
  password: Joi.string().min(8).required().messages({
    'string.min': 'Password must be at least 8 characters long',
    'any.required': 'Password is required',
  }),
});

// 2. Схема для логіну користувача
export const loginUserSchema = Joi.object({
  email: Joi.string().email().required().trim().messages({
    'string.email': 'Email must be a valid email address',
    'any.required': 'Email is required',
  }),
  password: Joi.string().required().messages({
    'any.required': 'Password is required',
  }),
});

// 3. Схема для запиту на надсилання листа скидання паролю
export const requestResetEmailSchema = Joi.object({
  email: Joi.string().email().required().trim().messages({
    'string.email': 'Email must be a valid email address',
    'any.required': 'Email is required',
  }),
});

// 4. Схема для самого скидання паролю
// ВИПРАВЛЕНО: Мінімальну довжину пароля збільшено з 6 до 8, як у registerUserSchema
export const resetPasswordSchema = Joi.object({
  token: Joi.string().required().messages({
    'any.required': 'Token is required',
  }),
  password: Joi.string().min(8).required().messages({
    'string.min': 'Password must be at least 8 characters long',
    'any.required': 'Password is required',
  }),
});
