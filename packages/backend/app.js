import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './swagger.config.js';
import router from './routes/router.js';
import { notFoundHandler } from './middlewares/notFoundHandler.js';
import { errorLogger } from './middlewares/errorLogger.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { logger } from './utils/logger.js';
import '../backend/cronjobs/generadorTurnos.js';
import '../backend/cronjobs/GeneradorNotificacionesAviso.js';

const app = express();

// --- Middlewares Globales ---
app.use(express.json());
app.use(
  cors({
    origin: process.env.ALLOWED_ORIGINS
      ? process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim())
      : true,
  }),
);

// --- Rutas Base y Health Check ---
app.get('/', (req, res) => {
  res.send('API Sweet Medical funcionando correctamente.');
});

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'sweet-medical-backend',
  });
});

// --- Documentación Swagger ---
app.use('/api-docs', swaggerUi.serve);
app.get(
  '/api-docs',
  swaggerUi.setup(swaggerSpec, { swaggerOptions: { persistAuthorizationData: true } }),
);

// --- Ruta alternativa para Swagger JSON ---
app.get('/swagger.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// --- Rutas de Negocio ---
app.use(router);

// --- Middlewares de Manejo de Errores ---
app.use(notFoundHandler);
app.use(errorLogger);
app.use(errorHandler);

// --- Método de Lanzamiento ---
app.launch = function () {
  const portToUse = this.port || process.env.PORT || 3001;

  this.listen(portToUse, async () => {
    logger.info(`Servidor listo en http://localhost:${portToUse}`);
    logger.info(`Health check: http://localhost:${portToUse}/health`);
    logger.info(`Documentación Swagger: http://localhost:${portToUse}/api-docs`);

    try {
      /*logger.info('Ejecutando carga automática...');

      const url = `http://localhost:${portToUse}/seeding/datos-iniciales`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const responseData = await response.json();

      if (response.ok) {
        logger.info('Carga automática exitosa!');
      } else {
        logger.error('La ruta respondió con error:', responseData);
      }*/
    } catch (error) {
      logger.error('No se pudo conectar a la ruta automática:', error.message);
    }
  });
};

export default app;
