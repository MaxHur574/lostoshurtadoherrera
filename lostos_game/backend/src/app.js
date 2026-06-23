import express      from "express";
import cors         from "cors";
import authRoutes   from "./routes/auth.routes.js";
import progressRoutes from "./routes/progress.routes.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:5173" }));
app.use(express.json());

// Rutas
app.use("/api", authRoutes);
app.use("/api/progress", progressRoutes);

// Health check
app.get("/api/health", (_req, res) => res.json({ ok: true }));

// Manejo global de errores (siempre al final)
app.use(errorHandler);

export default app;