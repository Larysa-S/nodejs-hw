import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs/promises';

// Налаштування Cloudinary з вашого .env
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const saveFileToCloudinary = async (filePath) => {
  try {
    // Завантажуємо файл у папку 'avatars' у хмарі Cloudinary
    const result = await cloudinary.uploader.upload(filePath, {
      folder: 'avatars',
      transformation: [{ width: 250, height: 250, crop: 'fill' }], // Автоматичний кроп під квадрат аватара
    });

    // Повертаємо пряме безпечне посилання на зображення (secure_url)
    return result.secure_url;
  } catch (error) {
    throw error;
  } finally {
    // КРИТЕРІЙ: Обов'язково видаляємо тимчасовий файл із нашого сервера (папки temp)
    await fs.unlink(filePath);
  }
};
