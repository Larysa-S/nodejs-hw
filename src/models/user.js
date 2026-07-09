import { Schema, model } from 'mongoose';

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: false,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 8, // Мінімальна довжина 8 символів
    },
  },
  {
    versionKey: false,
    timestamps: true, // Автоматичне створення createdAt та updatedAt
  },
);

// Хук pre('save'): якщо username не передано, копіюємо туди значення email
userSchema.pre('save', function (next) {
  if (!this.username) {
    this.username = this.email;
  }
  next();
});

// Метод toJSON: автоматично видаляє пароль перед відправкою клієнту
userSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.password;
    return ret;
  },
});

export const User = model('User', userSchema);
