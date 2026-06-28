import dotenv from 'dotenv';
import { setupServer } from './server.js';

// Ініціалізуємо змінні з .env файлу
dotenv.config();

// Запускаємо сервер
setupServer();
