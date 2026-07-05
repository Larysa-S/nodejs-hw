import pinoHttp from 'pino-http';

export const logger = pinoHttp({
  transport: {
    target: 'pino-pretty', // робить логи в консолі зручними для читання
  },
});
