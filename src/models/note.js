import { Schema, model } from 'mongoose';
import { TAGS } from '../contacts/tags.js';

const noteSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      default: '',
      trim: true,
    },
    tag: {
      type: String,
      enum: TAGS, // Використовуємо експортований масив
      default: 'Todo',
      index: true, // Додано індекс для швидкої фільтрації за вимогою
    },
  },
  {
    versionKey: false, // Прибирає технічне поле __v
    timestamps: true, // Автоматично додає поля createdAt та updatedAt
  },
);

export const Note = model('note', noteSchema, 'notes');
