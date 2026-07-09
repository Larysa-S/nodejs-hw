import createHttpError from 'http-errors';
import { Note } from '../models/note.js';

// 1. GET /notes — підтримує пагінацію, пошук, фільтрацію ТІЛЬКИ для поточного користувача
export const getAllNotes = async (req, res, next) => {
  try {
    const { page = 1, perPage = 10, tag, search } = req.query;

    const parsedPage = parseInt(page);
    const parsedPerPage = parseInt(perPage);
    const skip = (parsedPage - 1) * parsedPerPage;

    // ОБОВ'ЯЗКОВО: додаємо userId поточного користувача у фільтр
    const filter = { userId: req.user._id };

    if (tag) {
      filter.tag = tag;
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
      ];
    }

    const [notes, totalNotes] = await Promise.all([
      Note.find(filter).skip(skip).limit(parsedPerPage),
      Note.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(totalNotes / parsedPerPage);

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

// 2. GET /notes/:noteId — повертає нотатку, якщо вона належить поточному користувачу
export const getNoteById = async (req, res, next) => {
  try {
    const { noteId } = req.params;

    // Шукаємо за ID нотатки ТА ID користувача одночасно
    const note = await Note.findOne({ _id: noteId, userId: req.user._id });

    if (!note) {
      return next(createHttpError(404, 'Note not found'));
    }

    res.status(200).json(note);
  } catch (err) {
    next(err);
  }
};

// 3. POST /notes — створює нотатку з автоматичною прив'язкою userId
export const createNote = async (req, res, next) => {
  try {
    // Додаємо userId з об'єкта авторизованого користувача до тіла запиту перед збереженням
    const noteData = { ...req.body, userId: req.user._id };

    const note = await Note.create(noteData);
    res.status(201).json(note);
  } catch (err) {
    next(err);
  }
};

// 4. PATCH /notes/:noteId — оновлює нотатку тільки якщо вона належить користувачу
export const updateNote = async (req, res, next) => {
  try {
    const { noteId } = req.params;

    // Оновлюємо за складеною умовою для безпеки даних
    const note = await Note.findOneAndUpdate(
      { _id: noteId, userId: req.user._id },
      req.body,
      { returnDocument: 'after' },
    );

    if (!note) {
      return next(createHttpError(404, 'Note not found'));
    }

    res.status(200).json(note);
  } catch (err) {
    next(err);
  }
};

// 5. DELETE /notes/:noteId — видаляє нотатку тільки якщо вона належить користувачу
export const deleteNote = async (req, res, next) => {
  try {
    const { noteId } = req.params;

    // Видаляємо за складеною умовою
    const note = await Note.findOneAndDelete({
      _id: noteId,
      userId: req.user._id,
    });

    if (!note) {
      return next(createHttpError(404, 'Note not found'));
    }

    res.status(200).json(note);
  } catch (err) {
    next(err);
  }
};
