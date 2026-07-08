import createHttpError from 'http-errors';
import { Note } from '../models/note.js';

// 1. GET /notes — підтримує пагінацію (page, perPage), пошук та фільтрацію.
// Повертає детальну мета-інформацію та масив нотаток.
export const getAllNotes = async (req, res, next) => {
  try {
    // Отримуємо параметри з query-рядка із дефолтними значеннями за ТЗ
    const { page = 1, perPage = 10, tag, search } = req.query;

    // Перетворюємо значення у числа для математичних розрахунків
    const parsedPage = parseInt(page);
    const parsedPerPage = parseInt(perPage);

    const skip = (parsedPage - 1) * parsedPerPage;

    // Створюємо динамічний об'єкт фільтрації
    const filter = {};

    // Якщо передано конкретний тег
    if (tag) {
      filter.tag = tag;
    }

    // Якщо передано текст для пошуку через $regex в title або content
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
      ];
    }

    // Паралельно виконуємо два запити до бази даних для оптимізації швидкості
    const [notes, totalNotes] = await Promise.all([
      Note.find(filter).skip(skip).limit(parsedPerPage),
      Note.countDocuments(filter), // Рахуємо загальну кількість документів, що підходять під фільтр
    ]);

    // Розраховуємо загальну кількість сторінок
    const totalPages = Math.ceil(totalNotes / parsedPerPage);

    // Відповідь суворо за ТЗ зі статусом 200 та всіма необхідними властивостями
    res.status(200).json({
      page: parsedPage,
      perPage: parsedPerPage,
      totalNotes,
      totalPages,
      notes,
    });
  } catch (err) {
    next(err);
  }
};

// 2. GET /notes/:noteId — повертає чистий об'єкт нотатки
export const getNoteById = async (req, res, next) => {
  try {
    const { noteId } = req.params;
    const note = await Note.findById(noteId);

    if (!note) {
      return next(createHttpError(404, 'Note not found'));
    }

    res.status(200).json(note);
  } catch (err) {
    next(err);
  }
};

// 3. POST /notes — повертає створену нотатку без обгорток
export const createNote = async (req, res, next) => {
  try {
    const note = await Note.create(req.body);
    res.status(201).json(note);
  } catch (err) {
    next(err);
  }
};

// 4. PATCH /notes/:noteId — оновлено синтаксис для Mongoose 9.x.x
export const updateNote = async (req, res, next) => {
  try {
    const { noteId } = req.params;

    const note = await Note.findByIdAndUpdate(noteId, req.body, {
      returnDocument: 'after',
    });

    if (!note) {
      return next(createHttpError(404, 'Note not found'));
    }

    res.status(200).json(note);
  } catch (err) {
    next(err);
  }
};

// 5. DELETE /notes/:noteId — статус 200 та повернення видаленого об'єкта
export const deleteNote = async (req, res, next) => {
  try {
    const { noteId } = req.params;
    const note = await Note.findByIdAndDelete(noteId);

    if (!note) {
      return next(createHttpError(404, 'Note not found'));
    }

    res.status(200).json(note);
  } catch (err) {
    next(err);
  }
};
