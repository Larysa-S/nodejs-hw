import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser'; // Додано обов'язковий імпорт
import { errors } from 'celebrate';
import 'dotenv/config';

import { logger } from './middleware/logger.js';
import { notFoundHandler } from './middleware/notFoundHandler.js';
import { errorHandler } from './middleware/errorHandler.js';
import { connectMongoDB } from './db/connectMongoDB.js';
import notesRouter from './routes/notesRoutes.js';
import authRouter from './routes/authRoutes.js';
// КРИТЕРІЙ ТЗ: Імпортуємо роутер користувача для аватарок
import userRouter from './routes/userRoutes.js';

export const setupServer = async () => {
  const app = express();
  const PORT = process.env.PORT || 3000;

  // 1. Стандартні та кастомні логгери/парсери
  app.use(logger);

  // Налаштування CORS для безпечної передачі кукі авторизації
  const allowedOrigins = [
    'http://localhost:5173', // Стандартний порт для Vite фронтенду
    'http://localhost:3000',
  ];

  app.use(
    cors({
      origin: function (origin, callback) {
        // Дозволяємо запити без origin (наприклад, Postman)
        if (!origin) return callback(null, true);

        if (allowedOrigins.indexOf(origin) !== -1) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
      credentials: true, // Дозволяє браузеру приймати та надсилати кукі
    }),
  );

  app.use(express.json());
  app.use(cookieParser()); // ОБОВ'ЯЗКОВО: парсер кукі перед маршрутами

  // 2. Встановлення з’єднання з базою даних ПЕРЕД запуском сервера
  await connectMongoDB();

  // 3. Реєстрація маршрутів
  app.use(authRouter);
  app.use(userRouter);
  app.use(notesRouter);

  // 4. Обробка неіснуючих маршрутів (404)
  app.use(notFoundHandler);

  // 5. Обробка помилок валідації від celebrate
  app.use(errors());

  // 6. Глобальний обробник помилок сервера
  app.use(errorHandler);

  // Запуск сервера
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};

setupServer();
