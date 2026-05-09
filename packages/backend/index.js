import express from "express";
import cors from "cors";
import { turnoRouter } from './routes/turnoRoutes.js';

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

export default app;