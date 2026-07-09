import { Schema, model } from 'mongoose';
import { TAGS } from '../constants/tags.js';

const noteSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
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
    // Додаємо поле зв'язку з користувачем
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'user', // Має збігатися з назвою моделі у файлі user.js
      required: [true, 'User ID is required'],
    },
  },
  {
    versionKey: false,
    timestamps: true,
  },
);

// Створюємо складений індекс для швидкого пошуку нотаток конкретного користувача за тегом
noteSchema.index({ userId: 1, tag: 1 });

export const Note = model('note', noteSchema);
