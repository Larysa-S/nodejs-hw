import express from 'express';
import cors from 'cors';
import pinoHttp from 'pino-http';
import { notFoundHandler } from './middlewares/notFoundHandler.js';
import { errorHandler } from './middlewares/errorHandler.js';

export const setupServer = () => {
  const app = express();
  const PORT = process.env.PORT || 3000;

  // Глобальні стандартні Middleware
  app.use(pinoHttp());
  app.use(cors());
  app.use(express.json());

  // --- Маршрути проєкту ---

  // 1. GET /notes — отримати всі нотатки (заглушка)
  app.get('/notes', (req, res) => {
    res.status(200).json({
      message: 'Retrieved all notes',
    });
  });

  // 2. GET /notes/:noteId — отримати нотатку за ідентифікатором (заглушка)
  app.get('/notes/:noteId', (req, res) => {
    const { noteId } = req.params;
    res.status(200).json({
      message: `Retrieved note with ID: ${noteId}`,
    });
  });

  // 3. GET /test-error — тестовий маршрут для імітації помилки 500
  app.get('/test-error', () => {
    throw new Error('Simulated server error');
  });

  // --- Обробники помилок ---

  // Обробка неіснуючих маршрутів (404)
  app.use(notFoundHandler);

  // Обробка помилок (500) — обов'язково йде НАЙОСТАННІШИМ
  app.use(errorHandler);

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};
