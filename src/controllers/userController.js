import createHttpError from 'http-errors';
import { User } from '../models/user.js';
import { saveFileToCloudinary } from '../utils/saveFileToCloudinary.js';

export const updateUserAvatar = async (req, res, next) => {
  try {
    // 1. Перевіряємо наявність файлу в реквесті (Multer кладе його в req.file)
    if (!req.file) {
      throw createHttpError(400, 'No file');
    }

    // 2. Дістаємо ID поточного авторизованого користувача
    const userId = req.user._id;

    // 3. ВИПРАВЛЕНО: Явно передаємо і буфер файлу, і ID користувача як другий аргумент
    const cloudinaryResponse = await saveFileToCloudinary(
      req.file.buffer,
      userId,
    );

    // 4. Оновлюємо поле avatar користувача в базі даних
    // ВИПРАВЛЕНО: Замість застарілої опції { new: true } використовуємо { returnDocument: 'after' } за ТЗ
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { avatar: cloudinaryResponse.secure_url },
      { returnDocument: 'after' },
    );

    if (!updatedUser) {
      throw createHttpError(404, 'User not found');
    }

    // 5. У разі успіху повертаємо відповідь зі статусом 200 та об’єктом
    res.status(200).json({
      url: updatedUser.avatar,
    });
  } catch (error) {
    next(error);
  }
};
