import "dotenv/config";
import app from "./app.js";
import "../backend/cronjobs/generadorTurnos.js";

const PORT = process.env.SERVER_PORT || 3001;

app.listen(PORT, () => {
  console.log(`Backend de Sweet Medical escuchando en puerto ${PORT}`);
});
