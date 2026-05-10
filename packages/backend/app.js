import express from 'express';
import cors from 'cors';
import router from './routes/router.js';
import { notFoundHandler } from './middlewares/notFoundHandler.js';
import { errorLogger } from './middlewares/errorLogger.js';
import { errorHandler } from './middlewares/errorHandler.js';

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

// --- Rutas de Negocio ---
app.use(router);

// --- Middlewares de Manejo de Errores ---
app.use(notFoundHandler);
app.use(errorLogger);
app.use(errorHandler);

// --- Método de Lanzamiento ---
app.launch = function () {
  const portToUse = this.port || process.env.PORT || 3001;

  this.listen(portToUse, () => {
    console.log(`🚀 Servidor listo en http://localhost:${portToUse}`);
    console.log(`🏥 Health check: http://localhost:${portToUse}/health`);
  });
};

export default app;
