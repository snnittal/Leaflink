import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/User";
import { JWT_SECRET } from "../config";
import { authMiddleware, AuthRequest } from "../middleware/auth";
import logger from "../logger";
import { body, validationResult } from "express-validator";

const router = Router();

// Register
router.post(
  "/register",
  [
    body("name")
      .isLength({ min: 1, max: 50 })
      .withMessage("Name must be 1-50 characters"),
    body("email")
      .isEmail()
      .normalizeEmail()
      .withMessage("Valid email required"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
  ],
  async (req: Request, res: Response) => {
    logger.info("Register attempt for email:", req.body.email);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      logger.warn("Register validation failed:", errors.array());
      return res
        .status(400)
        .json({ message: "Validation failed", errors: errors.array() });
    }

    try {
      const { name, email, password } = req.body;

      const existing = await User.findOne({ email });
      if (existing)
        return res.status(400).json({ message: "Email already in use" });

      const passwordHash = await bcrypt.hash(password, 10);
      const user = await User.create({ name, email, passwordHash });

      const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
        expiresIn: "7d",
      });
      res.json({
        token,
        user: { id: user._id, name: user.name, email: user.email },
      });
    } catch (err) {
      logger.error("Error registering user:", err);
      res.status(500).json({ message: "Server error" });
    }
  },
);

// Login
router.post(
  "/login",
  [
    body("email")
      .isEmail()
      .normalizeEmail()
      .withMessage("Valid email required"),
    body("password").exists().withMessage("Password required"),
  ],
  async (req: Request, res: Response) => {
    logger.info("Login attempt for email:", req.body.email);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      logger.warn("Login validation failed:", errors.array());
      return res
        .status(400)
        .json({ message: "Validation failed", errors: errors.array() });
    }

    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email });
      logger.info("User found for login:", !!user);
      if (!user)
        return res.status(400).json({ message: "Invalid credentials" });

      const ok = await bcrypt.compare(password, user.passwordHash);
      logger.info("Password match:", ok);
      if (!ok) return res.status(400).json({ message: "Invalid credentials" });

      const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
        expiresIn: "7d",
      });
      res.json({
        token,
        user: { id: user._id, name: user.name, email: user.email },
      });
    } catch (err) {
      res.status(500).json({ message: "Server error" });
    }
  },
);

// Current user
router.get("/me", authMiddleware, async (req: AuthRequest, res) => {
  const user = await User.findById(req.userId);
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json({ id: user._id, name: user.name, email: user.email });
});

export default router;
