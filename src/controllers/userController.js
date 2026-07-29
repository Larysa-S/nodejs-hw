import createHttpError from 'http-errors';
import { User } from '../models/user.js';
import { saveFileToCloudinary } from '../utils/saveFileToCloudinary.js';

// Єдиний контролер у цьому файлі за вашим ТЗ
export const updateUserAvatar = async (req, res, next) => {
  try {
    // 1. Перевіряємо наявність файлу у реквесті (Multer завантажує буфер в req.file)
    if (!req.file) {
      throw createHttpError(400, 'No file');
    }

    // 2. Викликаємо утиліту saveFileToCloudinary, передаючи туди буфер файлу за ТЗ
    const cloudinaryResponse = await saveFileToCloudinary(req.file.buffer);

    // 3. Дістаємо ID поточного авторизованого користувача
    // (Мідлвара authenticate записує дані користувача в req.user)
    const userId = req.user._id;

    // 4. Оновлюємо поле avatar у базі даних, використовуючи отримане secure_url
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { avatar: cloudinaryResponse.secure_url },
      { new: true }, // Повертає оновлений документ
    );

    if (!updatedUser) {
      throw createHttpError(404, 'User not found');
    }

    // 5. У разі успіху повертаємо відповідь зі статусом 200 та об’єктом { url: ... }
    res.status(200).json({
      url: updatedUser.avatar,
    });
  } catch (error) {
    next(error);
  }
};
