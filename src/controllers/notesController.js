import createHttpError from 'http-errors';
import { Note } from '../models/note.js';

// 1. GET /notes — отримати всі нотатки
export const getNotesController = async (req, res, next) => {
  try {
    const notes = await Note.find();
    res.status(200).json({
      status: 200,
      message: 'Successfully found notes!',
      data: notes,
    });
  } catch (err) {
    next(err);
  }
};

// 2. GET /notes/:noteId — отримати нотатку за ID
export const getNoteByIdController = async (req, res, next) => {
  try {
    const { noteId } = req.params;
    const note = await Note.findById(noteId);

    if (!note) {
      return next(createHttpError(404, 'Note not found'));
    }

    res.status(200).json({
      status: 200,
      message: `Successfully found note with id ${noteId}!`,
      data: note,
    });
  } catch (err) {
    next(err);
  }
};

// 3. POST /notes — створити нотатку
export const createNoteController = async (req, res, next) => {
  try {
    const note = await Note.create(req.body);
    res.status(201).json({
      status: 201,
      message: 'Successfully created a note!',
      data: note,
    });
  } catch (err) {
    next(err);
  }
};

// 4. PATCH /notes/:noteId — оновити нотатку (updateNote)
export const updateNote = async (req, res, next) => {
  try {
    const { noteId } = req.params;
    const note = await Note.findByIdAndUpdate(noteId, req.body, { new: true });

    if (!note) {
      return next(createHttpError(404, 'Note not found'));
    }

    res.status(200).json({
      status: 200,
      message: 'Successfully patched a note!',
      data: note,
    });
  } catch (err) {
    next(err);
  }
};

// 5. DELETE /notes/:noteId — видалити нотатку
export const deleteNoteController = async (req, res, next) => {
  try {
    const { noteId } = req.params;
    const note = await Note.findByIdAndDelete(noteId);

    if (!note) {
      return next(createHttpError(404, 'Note not found'));
    }

    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
