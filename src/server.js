import express from 'express';
import cors from 'cors';
import 'dotenv/config'; // 1. Підключення dotenv

import { logger } from './middlewares/logger.js';
import { notFoundHandler } from './middlewares/notFoundHandler.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { connectMongoDB } from './db/connectMongoDB.js';
import notesRouter from './routers/notesRoutes.js';

export const setupServer = async () => {
  const app = express();
  const PORT = process.env.PORT || 3000;

  // 3. Підключення стандартних та кастомних middleware
  app.use(logger); // Логування HTTP-запитів
  app.use(cors()); // Дозвіл запитів з інших доменів
  app.use(express.json()); // Обробка JSON-тіла запитів

  // 2. Встановлення з’єднання з базою даних ПЕРЕД запуском сервера
  await connectMongoDB();

  // 4. Реєстрація маршрутів для роботи з колекцією нотаток
  app.use(notesRouter);

  // 5. Тестовий маршрут /test-error видалено

  // 6. Додавання middleware notFoundHandler після всіх маршрутів
  app.use(notFoundHandler);

  // 7. Додавання errorHandler як останній middleware у стеку
  app.use(errorHandler);

  // Запуск сервера
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};

setupServer();
