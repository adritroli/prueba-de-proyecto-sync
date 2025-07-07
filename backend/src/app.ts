import express from "express";
import { errorHandler } from "./middleware/errorHandler";
import notificationsRoutes from "./routes/notifications";

const app = express();

// Log para saber que el servidor está levantado y rutas cargadas
console.log("Inicializando servidor Express...");
console.log("Registrando rutas de notificaciones en /api/notifications");

app.use((req, res, next) => {
  // Log de cada request entrante
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

app.use(
  "/api/notifications",
  (req, res, next) => {
    console.log("Entrando a ruta /api/notifications");
    next();
  },
  notificationsRoutes
);

app.use(errorHandler);

export default app;