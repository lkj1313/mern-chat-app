import express from "express";

import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url"; // ✅ ES Module에서 __dirname 해결

// ✅ __dirname 생성 (ES Module 호환)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import userRoutes from "./routes/userRoutes.js";

dotenv.config();
const app = express();

app.use(express.json());
app.use(cors());
app.use("/api/auth", userRoutes);

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("📡 MongoDB Connected"))
  .catch((err) => console.log(err));

const PORT = process.env.PORT || 5005;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
