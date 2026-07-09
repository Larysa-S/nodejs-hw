import { Router } from 'express';
import { celebrate, Segments } from 'celebrate'; // Обов'язково імпортуємо Segments
import { authenticate } from '../middleware/authenticate.js';

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

// Захищаємо всі маршрути нотаток
notesRouter.use(authenticate);

// 1. GET /notes — валідуємо query-параметри
notesRouter.get(
  '/',
  celebrate({ [Segments.QUERY]: getAllNotesSchema }),
  getAllNotes,
);

// 2. GET /notes/:noteId — валідуємо params (ID в URL)
notesRouter.get(
  '/:noteId',
  celebrate({ [Segments.PARAMS]: noteIdSchema }),
  getNoteById,
);

// 3. POST /notes — валідуємо body (тіло запиту)
notesRouter.post(
  '/',
  celebrate({ [Segments.BODY]: createNoteSchema }),
  createNote,
);

// 4. DELETE /notes/:noteId — валідуємо params (ID в URL)
notesRouter.delete(
  '/:noteId',
  celebrate({ [Segments.PARAMS]: noteIdSchema }),
  deleteNote,
);

// 5. PATCH /notes/:noteId — валідуємо і params, і body через одну схему, якщо вона комбінована
notesRouter.patch(
  '/:noteId',
  celebrate({ [Segments.BODY]: updateNoteSchema }),
  updateNote,
);

export default notesRouter;
