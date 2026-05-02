import "dotenv/config";
import express from "express";
import cors from "cors";

import { turnoRouter } from './routes/turnoRoutes.js';

import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Conexión con mongoose exitosa');
  } catch (error) {
    console.error('Error de conexión con mongoose:', error);
    process.exit(1);
  }
};

await connectDB();

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: process.env.ALLOWED_ORIGINS
      ? process.env.ALLOWED_ORIGINS.split(",").map((o) => o.trim())
      : true,
  })
);

app.get("/", (req, res) => {
  res.send("API Sweet Medical funcionando correctamente.");
});

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    service: "sweet-medical-backend",
  });
});

app.use("/turnos", turnoRouter);

const PORT = process.env.SERVER_PORT || 3001;

app.listen(PORT, () => {
  console.log(`Backend de Sweet Medical escuchando en puerto ${PORT}`);
});
