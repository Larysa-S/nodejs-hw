import createHttpError from 'http-errors';
import { Note } from '../models/note.js';

// 1. GET /notes — тепер повертає чистий масив документів
export const getAllNotes = async (req, res, next) => {
  try {
    const notes = await Note.find();
    res.status(200).json(notes);
  } catch (err) {
    next(err);
  }
};

// 2. GET /notes/:noteId — тепер повертає чистий об'єкт нотатки
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

    // Замінено { new: true } на { returnDocument: 'after' }
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

    // Повертаємо видалену нотатку зі статусом 200 за вимогою бота
    res.status(200).json(note);
  } catch (err) {
    next(err);
  }
};
