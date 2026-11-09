import { Router } from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import auth from "../middleware/auth.js";

const router = Router();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadDir = path.join(__dirname, "../uploads");
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => cb(null, `${Date.now()}-${Math.round(Math.random()*1e9)}${path.extname(file.originalname).toLowerCase()}`)
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.mimetype)) return cb(new Error("Only JPG, PNG or WEBP images are allowed"));
    cb(null, true);
  }
});
router.post("/", auth, upload.single("image"), (req, res) => {
  if (!req.file) return res.status(400).json({ message: "Please select an image" });
  res.status(201).json({ imageUrl: `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}` });
});
export default router;
