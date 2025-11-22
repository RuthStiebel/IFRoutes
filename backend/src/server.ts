import express, { Application, Request, Response } from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import chartRoutes from "./routes/chartsRoutes";

// Load environment variables from .env file
dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/aviationdb";

// --- Middleware ---
app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json()); // Body parser middleware

// --- Database Connection ---
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("MongoDB connected successfully."))
  .catch((err) => {
    console.error("MongoDB connection failed:", err);
    process.exit(1); // Exit process if database connection fails
  });

// --- API Routes ---
app.use("/api", chartRoutes);
app.use("/data", express.static("data"));

// --- Simple Root Route ---
app.get("/", (req: Request, res: Response) => {
  res.send("Aviation Trainer Backend API is running.");
});

// --- Start Server ---
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log("API accessible at http://localhost:5000/api/charts/LLBG");
});
