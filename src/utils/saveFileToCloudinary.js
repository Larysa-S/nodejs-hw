import { v2 as cloudinary } from 'cloudinary';

// Конфігурація Cloudinary з вашого .env
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ВИПРАВЛЕНО: Функція приймає buffer та userId за вимогами ТЗ
export const saveFileToCloudinary = (buffer, userId) => {
  return new Promise((resolve, reject) => {
    // ВИПРАВЛЕНО: Організовуємо завантаження виключно через upload_stream
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'avatars',
        public_id: userId, // ВИПРАВЛЕНО: Використовуємо userId для встановлення public_id
        overwrite: true, // Дозволяє перезаписувати старий аватар при оновленні
        transformation: [{ width: 250, height: 250, crop: 'fill' }], // Опціональний кроп
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result); // Повертає проміс із об'єктом даних завантаженого зображення
      },
    );

    // ВИПРАВЛЕНО: Передаємо буфер безпосередньо в потік (без зчитування та видалення з диску)
    uploadStream.end(buffer);
  });
};
