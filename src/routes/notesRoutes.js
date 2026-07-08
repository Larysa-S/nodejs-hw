import { Router } from 'express';
import {
  getAllNotes,
  getNoteById,
  createNote,
  updateNote,
  deleteNote,
} from '../controllers/notesController.js';
import {
  getAllNotesSchema,
  noteIdSchema,
  createNoteSchema,
  updateNoteSchema,
} from '../validations/notesValidation.js';

const router = Router();

// 1. GET /notes — тепер з валідацією query параметрів
router.get('/', getAllNotesSchema, getAllNotes);

// 2. GET /notes/:noteId — тепер з валідацією ObjectId
router.get('/:noteId', noteIdSchema, getNoteById);

// 3. POST /notes — тепер з валідацією тіла запиту
router.post('/', createNoteSchema, createNote);

// 4. PATCH /notes/:noteId — тепер з комбінованою валідацією id та тіла
router.patch('/:noteId', updateNoteSchema, updateNote);

// 5. DELETE /notes/:noteId — тепер з валідацією ObjectId
router.delete('/:noteId', noteIdSchema, deleteNote);

export default router;
