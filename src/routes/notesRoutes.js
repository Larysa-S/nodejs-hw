import { Router } from 'express';
import {
  getAllNotes,
  getNoteById,
  createNote,
  updateNote,
  deleteNote,
} from '../controllers/notesController.js';

const router = Router();

// 1. GET /notes — отримати всі нотатки
router.get('/notes', getAllNotes);

// 2. GET /notes/:noteId — отримати нотатку за ID
router.get('/notes/:noteId', getNoteById);

// 3. POST /notes — створити нотатку
router.post('/notes', createNote);

// 4. PATCH /notes/:noteId — оновити нотатку за ID
router.patch('/notes/:noteId', updateNote);

// 5. DELETE /notes/:noteId — видалити нотатку за ID
router.delete('/notes/:noteId', deleteNote);

export default router;
