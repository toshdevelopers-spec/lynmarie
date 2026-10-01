import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import apiRouter from "./routes/index.js";
import { errorHandler, notFound } from "./middleware/errors.js";
import { prisma } from "./config/prisma.js";

const app = express();
app.use(helmet());

const frontendOrigins = (process.env.FRONTEND_URL || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({
  origin(origin, callback) {
    if (!origin || frontendOrigins.includes(origin)) return callback(null, true);
    return callback(new Error("Origin is not allowed by CORS"));
  },
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV !== "test") app.use(morgan("tiny"));

app.get("/api/health", async (req, res) => {
  try {
    const [database] = await prisma.$queryRaw`SELECT to_regclass('public.products') IS NOT NULL AS schema_ready`;
    if (!database?.schema_ready) return res.status(503).json({ success: false, message: "Database is connected, but the store schema is not installed. Run backend migrations.", services: { api: "running", database: "connected", schema: "missing" } });
    res.json({ success: true, message: "LynMarie Boutique API is running", environment: process.env.NODE_ENV || "development", services: { api: "running", database: "connected", schema: "ready" } });
  } catch (error) {
    if (process.env.NODE_ENV !== "production") console.error("Health check could not reach PostgreSQL:", error.message);
    res.status(503).json({ success: false, message: "PostgreSQL is unavailable. Start the database service and check backend DATABASE_URL.", services: { api: "running", database: "unavailable" } });
  }
});

app.use("/api", apiRouter);
app.use(notFound);
app.use(errorHandler);

export default app;
