import { Router, Response } from "express";
import { Post } from "../models/Post";
import { Comment } from "../models/Comment";
import { authMiddleware, AuthRequest } from "../middleware/auth";
import logger from "../logger";
import { body, validationResult } from "express-validator";

const router = Router();

// Feed: latest posts
router.get("/", async (_req, res) => {
  try {
    const { page = 1, limit = 20 } = _req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit as string))
      .populate("user", "name")
      .populate("book", "title author coverUrl");

    const total = await Post.countDocuments();
    res.json({
      posts,
      totalPages: Math.ceil(total / parseInt(limit as string)),
      currentPage: parseInt(page as string),
    });
  } catch (err) {
    logger.error("Error fetching posts:", err);
    res.status(500).json({ message: "Error fetching posts" });
  }
});

// Get posts for a specific book
router.get("/book/:bookId", authMiddleware, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const posts = await Post.find({ book: req.params.bookId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit as string))
      .populate("user", "name")
      .populate("book", "title author coverUrl");

    const total = await Post.countDocuments({ book: req.params.bookId });
    res.json({
      posts,
      totalPages: Math.ceil(total / parseInt(limit as string)),
      currentPage: parseInt(page as string),
    });
  } catch (err) {
    logger.error("Error fetching posts for book:", err);
    res.status(500).json({ message: "Error fetching posts for book" });
  }
});

// Create a post (review/thought)
router.post(
  "/",
  authMiddleware,
  [
    body("bookId").isMongoId().withMessage("Valid book ID required"),
    body("content")
      .isLength({ min: 1, max: 2000 })
      .withMessage("Content must be 1-2000 characters"),
    body("rating")
      .optional()
      .isInt({ min: 1, max: 5 })
      .withMessage("Rating must be 1-5"),
  ],
  async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json({ message: "Validation failed", errors: errors.array() });
    }

    try {
      const {
        bookId,
        content,
        rating,
        type,
        videoUrl,
        thumbnailUrl,
        durationSeconds,
        textSummary,
      } = req.body;
      if (!req.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const post = await Post.create({
        user: req.userId,
        book: bookId,
        content,
        rating,
        type: type === "video" ? "video" : "text",
        videoUrl,
        thumbnailUrl,
        durationSeconds,
        textSummary,
      });

      // Populate user + book on the created document
      await post.populate([
        { path: "user", select: "name" },
        { path: "book", select: "title author coverUrl" },
      ]);

      res.status(201).json(post);
    } catch (err) {
      logger.error("Error creating post:", err);
      res.status(500).json({ message: "Error creating post" });
    }
  },
);

// Like/unlike a post
router.post("/:id/like", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Not found" });

    const userId = req.userId!;
    const already = post.likes.some((id) => id.toString() === userId);

    if (already) {
      post.likes = post.likes.filter((id) => id.toString() !== userId);
    } else {
      post.likes.push(userId as any);
    }

    await post.save();

    // Re-fetch with population so the frontend gets user + book info
    const populated = await Post.findById(post._id)
      .populate("user", "name")
      .populate("book", "title author coverUrl");

    res.json(populated);
  } catch (err) {
    logger.error("Error liking/unliking post:", err);
    res.status(500).json({ message: "Error updating like" });
  }
});

/* ---------------------------------------------------
   COMMENTS: /api/posts/:id/comments
--------------------------------------------------- */

// Get all comments for a post (flat list; frontend will thread them)
router.get("/:id/comments", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const comments = await Comment.find({ post: req.params.id })
      .sort({ createdAt: 1 })
      .populate("user", "name");

    res.json(comments);
  } catch (err) {
    logger.error("Error fetching comments:", err);
    res.status(500).json({ message: "Error fetching comments" });
  }
});

// Create a comment (optional parentCommentId for threaded replies)
router.post(
  "/:id/comments",
  authMiddleware,
  [
    body("content")
      .isLength({ min: 1, max: 1000 })
      .withMessage("Content must be 1-1000 characters"),
    body("parentCommentId")
      .optional()
      .isMongoId()
      .withMessage("Invalid parent comment ID"),
  ],
  async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json({ message: "Validation failed", errors: errors.array() });
    }

    try {
      const { content, parentCommentId } = req.body;
      if (!req.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      // Ensure post exists
      const post = await Post.findById(req.params.id);
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }

      const comment = await Comment.create({
        post: post._id,
        user: req.userId,
        content: content.trim(),
        parentComment: parentCommentId || undefined,
      });

      await comment.populate({ path: "user", select: "name" });

      res.status(201).json(comment);
    } catch (err) {
      logger.error("Error creating comment:", err);
      res.status(500).json({ message: "Error creating comment" });
    }
  },
);

export default router;
