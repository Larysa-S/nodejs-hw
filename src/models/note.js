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
    // ВИПРАВЛЕНО: значення ref змінено на 'User' з великої літери
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
  },
  {
    versionKey: false,
    timestamps: true,
  },
);

noteSchema.index({ userId: 1, tag: 1 });

// ВИПРАВЛЕНО: ім'я моделі змінено на 'Note' з великої літери
export const Note = model('Note', noteSchema);
