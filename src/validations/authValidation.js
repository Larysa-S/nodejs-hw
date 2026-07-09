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
  // Дозволяємо також необов'язкове поле username, якщо воно буде передане
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
