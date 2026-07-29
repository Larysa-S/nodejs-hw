import Joi from 'joi';

// Схема для реєстрації користувача
export const registerUserSchema = Joi.object({
  email: Joi.string().email().required().trim().messages({
    'string.email': 'Email must be a valid email address',
    'any.required': 'Email is required',
  }),
  password: Joi.string().min(8).required().messages({
    'string.min': 'Password must be at least 8 characters long',
    'any.required': 'Password is required',
  }),
  username: Joi.string().trim().optional(),
});

// Схема для логіну користувача
export const loginUserSchema = Joi.object({
  email: Joi.string().email().required().trim().messages({
    'string.email': 'Email must be a valid email address',
    'any.required': 'Email is required',
  }),
  password: Joi.string().required().messages({
    'any.required': 'Password is required',
  }),
});

// Схема для запиту на надсилання листа (Додаємо її сюди за ТЗ)
export const requestResetEmailSchema = Joi.object({
  email: Joi.string().email().required().trim().messages({
    'string.email': 'Email must be a valid email address',
    'any.required': 'Email is required',
  }),
});

// Схема для самого скидання паролю
export const resetPasswordSchema = Joi.object({
  token: Joi.string().required().messages({
    'any.required': 'Token is required',
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'Password must be at least 6 characters long',
    'any.required': 'Password is required',
  }),
});
