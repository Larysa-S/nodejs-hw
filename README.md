# Node.js Homework — Notes Express App

Мінімальний вебсервер на Express для роботи з колекцією нотаток. Проєкт створено в межах навчального курсу Node.js.

## 🛠 Технологічний стек

- **Runtime:** Node.js (ES Modules)
- **Framework:** Express 5
- **Logging:** pino-http + pino-pretty
- **Tools:** nodemon, cors, dotenv, eslint

## 🚀 Як запустити локально

1. Клонуйте репозиторій та перейдіть у папку проєкту:

   ```bash
   git clone https://github.com
   cd nodejs-hw
   git checkout 01-express
   ```

2. Встановіть залежності:

   ```bash
   npm install
   ```

3. Створіть файл `.env` у корені проєкту та вкажіть порт:

   ```env
   PORT=3000
   ```

4. Запустіть сервер у режимі розробки (з автоперезапуском):
   ```bash
   npm run dev
   ```

## 📡 Доступні маршрути (API Endpoints)

- `GET /notes` — Повертає повідомлення-заглушку про успішне отримання всіх нотаток.
- `GET /notes/:noteId` — Повертає повідомлення з динамічним ідентифікатором нотатки.
- `GET /test-error` — Маршрут для імітації внутрішньої помилки сервера (500 Internal Server Error).

## 🛡 Обробка помилок

У проєкті реалізовано централізовану обробку помилок за допомогою кастомних middleware:

- **404 Route not found** — для будь-яких неіснуючих маршрутів.
- **500 Something went wrong** — для критичних збоїв у коді.
