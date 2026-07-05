import { isHttpError } from 'http-errors';

export const errorHandler = (err, req, res, next) => {
  // Якщо це помилка з бібліотеки http-errors, беремо її статус, інакше — 500
  const status = isHttpError(err) ? err.status : 500;

  res.status(status).json({
    message: err.message || 'Internal Server Error',
  });
};
