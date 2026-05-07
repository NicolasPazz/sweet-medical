import "dotenv/config";
import app from "./app.js";

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

const PORT = process.env.SERVER_PORT || 3001;

app.listen(PORT, () => {
  console.log(`Backend de Sweet Medical escuchando en puerto ${PORT}`);
});

export default app;
