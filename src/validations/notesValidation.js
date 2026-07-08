import { celebrate, Joi, Segments } from 'celebrate';
import { isValidObjectId } from 'mongoose';
import { TAGS } from '../contacts/tags.js'; // Імпорт масиву за ТЗ

// Кастомна функція валідації для перевірки MongoDB ObjectId
const objectIdCustomValidator = (value, helpers) => {
  if (!isValidObjectId(value)) {
    return helpers.message(
      'Invalid noteId format. Must be a valid MongoDB ObjectId',
    );
  }
  return value;
};

// GET /notes — валідація query-параметрів
export const getAllNotesSchema = celebrate({
  [Segments.QUERY]: Joi.object().keys({
    page: Joi.number().integer().min(1).default(1),
    perPage: Joi.number().integer().min(5).max(20).default(10),
    tag: Joi.string()
      .valid(...TAGS)
      .optional(),
    search: Joi.string().allow('').optional(),
  }),
});

// GET /notes/:noteId та DELETE /notes/:noteId — валідація параметра id
export const noteIdSchema = celebrate({
  [Segments.PARAMS]: Joi.object().keys({
    noteId: Joi.string().custom(objectIdCustomValidator).required(),
  }),
});

// POST /notes — валідація тіла запиту
export const createNoteSchema = celebrate({
  [Segments.BODY]: Joi.object().keys({
    title: Joi.string().min(1).required(),
    content: Joi.string().allow('').optional(),
    tag: Joi.string()
      .valid(...TAGS)
      .optional(),
  }),
});

// PATCH /notes/:noteId — комбінована валідація id та тіла (не менше 1 поля)
export const updateNoteSchema = celebrate({
  [Segments.PARAMS]: Joi.object().keys({
    noteId: Joi.string().custom(objectIdCustomValidator).required(),
  }),
  [Segments.BODY]: Joi.object()
    .keys({
      title: Joi.string().min(1).optional(),
      content: Joi.string().allow('').optional(),
      tag: Joi.string()
        .valid(...TAGS)
        .optional(),
    })
    .min(1), // Гарантує, що хоча б одне поле передано
});
