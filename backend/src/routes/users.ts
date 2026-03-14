import { Router, Response } from "express";
import mongoose from "mongoose";
import { authMiddleware, AuthRequest } from "../middleware/auth";
import { User } from "../models/User";
import { Post } from "../models/Post";
import { Book } from "../models/Book";
import { Club } from "../models/Club";
import logger from "../logger";

const router = Router();

// helper to build overview for a given user
const buildUserOverview = async (targetUserId: string, res: Response) => {
  if (!mongoose.Types.ObjectId.isValid(targetUserId)) {
    return res.status(400).json({ message: "Invalid user id" });
  }

  const user = await User.findById(targetUserId);
  if (!user) return res.status(404).json({ message: "User not found" });

  // posts authored by this user
  const posts = await Post.find({ user: targetUserId })
    .sort({ createdAt: -1 })
    .populate("book", "title author coverUrl");

  // posts they liked (to derive liked books)
  const likedPosts = await Post.find({ likes: targetUserId }).populate(
    "book",
    "title author coverUrl",
  );

  // unique liked books
  const likedBooksMap = new Map<string, any>();
  likedPosts.forEach((p: any) => {
    if (p.book && p.book._id) {
      likedBooksMap.set(p.book._id.toString(), p.book);
    }
  });
  const likedBooks = Array.from(likedBooksMap.values());

  // clubs they are a member of
  const clubs = await Club.find({ members: targetUserId })
    .populate("owner", "name")
    .populate("currentBook", "title author");

  return res.json({
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
    },
    posts,
    likedBooks,
    clubs,
  });
};

// 🔹 current user's profile overview
router.get("/me/overview", authMiddleware, async (req: AuthRequest, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    await buildUserOverview(req.userId, res);
  } catch (err) {
    logger.error("Error fetching self overview:", err);
    res.status(500).json({ message: "Error fetching profile" });
  }
});

// 🔹 any user's profile overview (by id)
router.get("/:id/overview", authMiddleware, async (req: AuthRequest, res) => {
  try {
    await buildUserOverview(req.params.id, res);
  } catch (err) {
    logger.error("Error fetching user overview:", err);
    res.status(500).json({ message: "Error fetching profile" });
  }
});

export default router;
