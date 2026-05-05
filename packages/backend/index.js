import "dotenv/config";
import express from "express";
import cors from "cors";
import router from "./routes/router.js";
import { notFoundHandler } from "./middlewares/notFoundHandler.js";
import { errorLogger } from "./middlewares/errorLogger.js";
import { errorHandler } from "./middlewares/errorHandler.js";

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: process.env.ALLOWED_ORIGINS
      ? process.env.ALLOWED_ORIGINS.split(",").map((o) => o.trim())
      : true,
  })
);
app.use(router);

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

app.use(notFoundHandler);
app.use(errorLogger);
app.use(errorHandler);

const PORT = process.env.SERVER_PORT || 3001;

app.listen(PORT, () => {
  console.log(`Backend de Sweet Medical escuchando en puerto ${PORT}`);
});

export default app;
