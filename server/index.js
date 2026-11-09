import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import authRoutes from "./routes/auth.js";
import listingRoutes from "./routes/listings.js";
import bookingRoutes from "./routes/bookings.js";
import uploadRoutes from "./routes/uploads.js";

dotenv.config();
const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173" }));
app.use(express.json({ limit: "2mb" }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/", (_req, res) => res.json({ message: "StayEase API is running" }));
app.use("/api/auth", authRoutes);
app.use("/api/listings", listingRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/uploads", uploadRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || "Server error" });
});

const PORT = process.env.PORT || 5000;
if (!process.env.MONGO_URI) {
  console.error("MONGO_URI is missing. Add it to server/.env");
  process.exit(1);
}
mongoose.connect(process.env.MONGO_URI)
  .then(() => app.listen(PORT, () => console.log(`StayEase API running on port ${PORT}`)))
  .catch((error) => {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  });
