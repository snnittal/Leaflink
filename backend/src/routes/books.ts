import { Router, Request, Response } from "express";
import { Book } from "../models/Book";
import { authMiddleware } from "../middleware/auth";
import logger from "../logger";
import { body, validationResult } from "express-validator";

const router = Router();

// List books (simple search)
router.get("/", async (req, res) => {
  try {
    const { q } = req.query;
    const filter = q ? { title: { $regex: q as string, $options: "i" } } : {};
    const books = await Book.find(filter).limit(50);
    res.json(books);
  } catch (err) {
    logger.error("Error fetching books:", err);
    res.status(500).json({ message: "Error fetching books" });
  }
});

// Create book (for now, open to any auth user)
router.post(
  "/",
  authMiddleware,
  [
    body("title")
      .isLength({ min: 1, max: 200 })
      .withMessage("Title must be 1-200 characters"),
    body("author")
      .isLength({ min: 1, max: 100 })
      .withMessage("Author must be 1-100 characters"),
    body("coverUrl").optional().isURL().withMessage("Invalid cover URL"),
    body("description")
      .optional()
      .isLength({ max: 1000 })
      .withMessage("Description max 1000 characters"),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json({ message: "Validation failed", errors: errors.array() });
    }

    try {
      const { title, author, coverUrl, description } = req.body;
      const book = await Book.create({ title, author, coverUrl, description });
      res.json(book);
    } catch (err) {
      logger.error("Error creating book:", err);
      res.status(500).json({ message: "Error creating book" });
    }
  },
);

// Get book by id
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: "Not found" });
    res.json(book);
  } catch (err) {
    logger.error("Error fetching book:", err);
    res.status(500).json({ message: "Error fetching book" });
  }
});

// Get similar books (by same author, excluding current book)
router.get("/:id/similar", authMiddleware, async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: "Not found" });

    const similarBooks = await Book.find({
      author: book.author,
      _id: { $ne: book._id },
    }).limit(6);

    res.json(similarBooks);
  } catch (err) {
    logger.error("Error fetching similar books:", err);
    res.status(500).json({ message: "Error fetching similar books" });
  }
});

export default router;
