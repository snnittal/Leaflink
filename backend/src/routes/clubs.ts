import { Router, Response } from "express";
import { authMiddleware, AuthRequest } from "../middleware/auth";
import { Club } from "../models/Club";
import { ClubMessage } from "../models/ClubMessage";
import { Server } from "socket.io";
import logger from "../logger";
import { body, validationResult } from "express-validator";

const router = Router();
const getIo = (req: any) => req.app.get("io") as Server | undefined;

// List clubs with optional search
router.get("/", async (req, res) => {
  try {
    const { q } = req.query;
    const filter = q ? { name: { $regex: q as string, $options: "i" } } : {};
    const clubs = await Club.find(filter)
      .populate("owner", "name")
      .populate("currentBook", "title author");
    res.json(clubs);
  } catch (err) {
    logger.error("Error listing clubs:", err);
    res.status(500).json({ message: "Error fetching clubs" });
  }
});

/* ---------- MESSAGES ROUTES MUST COME BEFORE /:id ---------- */

// 💬 Get messages for a club
router.get(
  "/:id/messages",
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    try {
      const { page = 1, limit = 50 } = req.query;
      const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
      const messages = await ClubMessage.find({ club: req.params.id })
        .sort({ createdAt: 1 })
        .skip(skip)
        .limit(parseInt(limit as string))
        .populate("user", "name");

      const total = await ClubMessage.countDocuments({ club: req.params.id });
      res.json({
        messages,
        totalPages: Math.ceil(total / parseInt(limit as string)),
        currentPage: parseInt(page as string),
      });
    } catch (err) {
      logger.error("Error fetching club messages:", err);
      res.status(500).json({ message: "Error fetching club messages" });
    }
  },
);

// 💬 Send a message to a club
router.post(
  "/:id/messages",
  authMiddleware,
  [
    body("content")
      .isLength({ min: 1, max: 1000 })
      .withMessage("Content must be 1-1000 characters"),
  ],
  async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json({ message: "Validation failed", errors: errors.array() });
    }

    try {
      const { content } = req.body;

      const club = await Club.findById(req.params.id);
      if (!club) {
        return res.status(404).json({ message: "Club not found" });
      }

      const message = await ClubMessage.create({
        club: club._id,
        user: req.userId,
        content: content.trim(),
      });

      await message.populate({ path: "user", select: "name" });

      const io = req.app.get("io") as Server | undefined;
      if (io) {
        io.to(`club_${req.params.id}`).emit("clubMessage", message);
      }

      res.status(201).json(message);
    } catch (err) {
      logger.error("Error sending club message:", err);
      res.status(500).json({ message: "Error sending club message" });
    }
  },
);

/* ----------------- OTHER CLUB ROUTES ----------------- */

// Create club
router.post(
  "/",
  authMiddleware,
  [
    body("name")
      .isLength({ min: 1, max: 100 })
      .withMessage("Name must be 1-100 characters"),
    body("description")
      .optional()
      .isLength({ max: 500 })
      .withMessage("Description max 500 characters"),
    body("currentBookId").optional().isMongoId().withMessage("Invalid book ID"),
  ],
  async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json({ message: "Validation failed", errors: errors.array() });
    }

    try {
      const { name, description, currentBookId } = req.body;

      const club = await Club.create({
        name: name.trim(),
        description: description?.trim() || undefined,
        owner: req.userId,
        members: [req.userId],
        currentBook: currentBookId || undefined,
      });

      await club.populate([
        { path: "owner", select: "name" },
        { path: "currentBook", select: "title author" },
      ]);

      res.status(201).json(club);
    } catch (err: any) {
      logger.error("Error creating club:", err);
      if (err.name === "ValidationError") {
        return res.status(400).json({ message: err.message });
      }
      res.status(500).json({ message: "Error creating club" });
    }
  },
);

// Join club
router.post("/:id/join", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const club = await Club.findById(req.params.id);
    if (!club) return res.status(404).json({ message: "Not found" });

    const userId = req.userId!;
    if (!club.members.some((m) => m.toString() === userId)) {
      club.members.push(userId as any);
      await club.save();
    }

    await club.populate([
      { path: "owner", select: "name" },
      { path: "currentBook", select: "title author" },
      { path: "members", select: "name" },
    ]);

    res.json(club);
  } catch (err) {
    logger.error("Error joining club:", err);
    res.status(500).json({ message: "Error joining club" });
  }
});

// Get club by id
router.get("/:id", async (req, res) => {
  try {
    const club = await Club.findById(req.params.id)
      .populate("owner", "name")
      .populate("members", "name")
      .populate("currentBook", "title author");

    if (!club) return res.status(404).json({ message: "Not found" });
    res.json(club);
  } catch (err) {
    logger.error("Error fetching club:", err);
    res.status(500).json({ message: "Error fetching club" });
  }
});

// Mark message seen
router.post(
  "/:id/messages/:msgId/seen",
  authMiddleware,
  async (req: AuthRequest, res) => {
    try {
      const { id, msgId } = req.params;
      const userId = req.userId!;
      const msg = await ClubMessage.findById(msgId);
      if (!msg) return res.status(404).json({ message: "Message not found" });

      if (!msg.seenBy.some((u) => u.toString() === userId)) {
        msg.seenBy.push(userId as any);
        await msg.save();
      }

      const io = getIo(req);
      if (io) {
        io.to(`club_${id}`).emit("messageSeen", { msgId, userId });
      }

      res.json({ success: true });
    } catch (err) {
      logger.error("Error marking message seen:", err);
      res.status(500).json({ message: "Error marking message seen" });
    }
  },
);

// Edit message
router.patch(
  "/:id/messages/:msgId",
  authMiddleware,
  [
    body("content")
      .isLength({ min: 1, max: 1000 })
      .withMessage("Content must be 1-1000 characters"),
  ],
  async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json({ message: "Validation failed", errors: errors.array() });
    }

    try {
      const { id, msgId } = req.params;
      const { content } = req.body;
      const userId = req.userId!;

      const msg = await ClubMessage.findById(msgId);
      if (!msg) return res.status(404).json({ message: "Message not found" });
      if (msg.user.toString() !== userId) {
        return res.status(403).json({ message: "Not allowed" });
      }

      msg.content = content.trim();
      await msg.save();
      await msg.populate("user", "name");

      const io = getIo(req);
      if (io) {
        io.to(`club_${id}`).emit("messageUpdated", msg);
      }

      res.json(msg);
    } catch (err) {
      logger.error("Error editing message:", err);
      res.status(500).json({ message: "Error editing message" });
    }
  },
);

// Delete message
router.delete(
  "/:id/messages/:msgId",
  authMiddleware,
  async (req: AuthRequest, res) => {
    try {
      const { id, msgId } = req.params;
      const userId = req.userId!;

      const msg = await ClubMessage.findById(msgId);
      if (!msg) return res.status(404).json({ message: "Message not found" });
      if (msg.user.toString() !== userId) {
        return res.status(403).json({ message: "Not allowed" });
      }

      await msg.deleteOne();

      const io = getIo(req);
      if (io) {
        io.to(`club_${id}`).emit("messageDeleted", { msgId });
      }

      res.json({ success: true });
    } catch (err) {
      logger.error("Error deleting message:", err);
      res.status(500).json({ message: "Error deleting message" });
    }
  },
);

// Pin message (store content only; simple)
router.post(
  "/:id/pin",
  authMiddleware,
  [
    body("content")
      .isLength({ min: 1, max: 500 })
      .withMessage("Content must be 1-500 characters"),
  ],
  async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json({ message: "Validation failed", errors: errors.array() });
    }

    try {
      const { id } = req.params;
      const { content } = req.body;

      const club = await Club.findById(id);
      if (!club) return res.status(404).json({ message: "Club not found" });

      club.pinnedMessage = {
        content: content.trim(),
        user: req.userId,
        createdAt: new Date(),
      } as any;

      await club.save();

      const io = getIo(req);
      if (io) {
        io.to(`club_${id}`).emit("pinnedUpdated", club.pinnedMessage);
      }

      res.json(club.pinnedMessage);
    } catch (err) {
      logger.error("Error pinning message:", err);
      res.status(500).json({ message: "Error pinning message" });
    }
  },
);

export default router;
