import { Router } from 'express';
import { celebrate } from 'celebrate';

import {
  getAllNotesSchema,
  noteIdSchema,
  createNoteSchema,
  updateNoteSchema,
} from '../validations/notesValidation.js';

// Імпортуємо контролери
import {
  getAllNotes,
  getNoteById,
  createNote,
  deleteNote,
  updateNote,
} from '../controllers/notesController.js';

const notesRouter = Router();

// 1. GET /notes — обов'язково обгортаємо схему в celebrate()
notesRouter.get('/', celebrate(getAllNotesSchema), getAllNotes);

// 2. GET /notes/:noteId — обгортаємо схему в celebrate()
notesRouter.get('/:noteId', celebrate(noteIdSchema), getNoteById);

// 3. POST /notes — обгортаємо схему в celebrate()
notesRouter.post('/', celebrate(createNoteSchema), createNote);

// 4. DELETE /notes/:noteId — обгортаємо схему в celebrate()
notesRouter.delete('/:noteId', celebrate(noteIdSchema), deleteNote);

// 5. PATCH /notes/:noteId — використовуємо ОДНУ комбіновану схему всередині celebrate()
notesRouter.patch('/:noteId', celebrate(updateNoteSchema), updateNote);

export default notesRouter;
