import { Router } from 'express';
import * as notesControllers from '../controllers/notesController.js';

const router = Router();

// 1. GET /notes — отримати всі нотатки
router.get('/notes', notesControllers.getNotesController);

// 2. GET /notes/:noteId — отримати нотатку за ID
router.get('/notes/:noteId', notesControllers.getNoteByIdController);

// 3. POST /notes — створити нотатку
router.post('/notes', notesControllers.createNoteController);

// 4. PATCH /notes/:noteId — оновити нотатку за ID
router.patch('/notes/:noteId', notesControllers.updateNote);

// 5. DELETE /notes/:noteId — видалити нотатку за ID
router.delete('/notes/:noteId', notesControllers.deleteNoteController);

export default router;
