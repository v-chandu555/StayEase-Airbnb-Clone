import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import auth from "../middleware/auth.js";

const router = Router();
const makeToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
const publicUser = (user) => ({ id: user._id, name: user.name, email: user.email });

router.post("/register", async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name?.trim() || !email?.trim() || !password) return res.status(400).json({ message: "Name, email and password are required" });
    if (password.length < 6) return res.status(400).json({ message: "Password must be at least 6 characters" });
    const normalizedEmail = email.trim().toLowerCase();
    if (await User.findOne({ email: normalizedEmail })) return res.status(409).json({ message: "An account with this email already exists" });
    const user = await User.create({ name: name.trim(), email: normalizedEmail, password: await bcrypt.hash(password, 12) });
    res.status(201).json({ token: makeToken(user._id), user: publicUser(user) });
  } catch (error) { next(error); }
});

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email?.trim().toLowerCase() });
    if (!user || !(await bcrypt.compare(password || "", user.password))) return res.status(401).json({ message: "Invalid email or password" });
    res.json({ token: makeToken(user._id), user: publicUser(user) });
  } catch (error) { next(error); }
});

router.get("/me", auth, (req, res) => res.json({ user: publicUser(req.user) }));
export default router;
