import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './swagger.config.js';
import router from './routes/router.js';
import { notFoundHandler } from './middlewares/notFoundHandler.js';
import { errorLogger } from './middlewares/errorLogger.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { logger } from './utils/logger.js';
import { getHost, getPort, getPublicBaseUrl } from './utils/serverConfig.js';
import '../backend/cronjobs/generadorSlots.js';
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
  const portToUse = this.port || getPort();
  const host = getHost();
  const baseUrl = getPublicBaseUrl(portToUse);

  this.httpServer = this.listen(portToUse, host, async () => {
    logger.info(`Servidor escuchando en ${host}:${portToUse}`);
    logger.info(`URL pública configurada: ${baseUrl}`);
    logger.info(`Health check: ${baseUrl}/health`);
    logger.info(`Documentación Swagger: ${baseUrl}/api-docs`);

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

  // Evita que conexiones HTTP keep-alive abiertas retengan el puerto
  // ocupado más de la cuenta cuando `node --watch` intenta reiniciar el proceso.
  this.httpServer.keepAliveTimeout = 5000;

  return this.httpServer;
};

/**
 * Cierra el servidor HTTP de forma prolija (deja de aceptar conexiones nuevas
 * y espera a que terminen las conexiones activas). Se usa en el shutdown
 * graceful desde index.js para liberar el puerto entre reinicios.
 */
app.shutdown = function () {
  return new Promise((resolve) => {
    if (!this.httpServer) return resolve();
    this.httpServer.close(() => resolve());
  });
};

export default app;
