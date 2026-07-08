import { Schema, model } from 'mongoose';
import { TAGS } from '../constants/tags.js';

const noteSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'], // Додали кастомне повідомлення про помилку
      trim: true,
    },
    content: {
      type: String,
      default: '',
      trim: true,
    },
    tag: {
      type: String,
      enum: TAGS,
      default: 'Todo',
    },
  },
  {
    versionKey: false,
    timestamps: true,
  },
);

// Правильне створення звичайного індексу на рівні схеми
noteSchema.index({ tag: 1 });

export const Note = model('note', noteSchema);
