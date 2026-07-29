import multer from 'multer';
import createHttpError from 'http-errors';

// 1. Зберігаємо файл у пам’яті (memoryStorage) за ТЗ
const storage = multer.memoryStorage();

// 2. Дозволяємо тільки файли з mimetype, що починається з image/
const fileFilter = (req, file, cb) => {
  if (file.mimetype && file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    // У випадку невідповідності повертає помилку за ТЗ
    cb(createHttpError(400, 'Only images allowed'), false);
  }
};

// 3. Експортуємо налаштований мідлвар upload
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024, // Обмежуємо розмір файлу до 2MB за ТЗ
  },
});
