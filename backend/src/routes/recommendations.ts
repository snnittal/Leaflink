import { Router } from "express";
import { authMiddleware, AuthRequest } from "../middleware/auth";
import { Post } from "../models/Post";
import { Book } from "../models/Book";
import logger from "../logger";

const router = Router();

/**
 * Very simple "recommendation" for now:
 * - Find books the user has posted about
 * - Recommend other books by the same authors
 * - If not enough, fill with random books
 *
 * Later: replace core logic with an AI model call.
 */
router.get("/books", async (req: AuthRequest, res) => {
  try {
    const userId = req.userId;

    let recommended;

    if (userId) {
      // Personalized recommendations for logged-in users
      // Books the user has engaged with
      const posts = await Post.find({ user: userId }).populate("book");
      const seenBookIds = new Set<string>();
      const authors = new Set<string>();

      posts.forEach((p: any) => {
        if (p.book) {
          seenBookIds.add(p.book._id.toString());
          if (p.book.author) authors.add(p.book.author);
        }
      });

      // Prefer books by same authors user has read
      recommended = await Book.find({
        author: { $in: Array.from(authors) },
        _id: { $nin: Array.from(seenBookIds) },
      }).limit(10);

      // If not enough, fill with random-ish picks
      if (recommended.length < 10) {
        const more = await Book.aggregate([
          {
            $match: {
              _id: {
                $nin: Array.from(seenBookIds).map(
                  (id) => new (require("mongoose").Types.ObjectId)(id),
                ),
              },
            },
          },
          { $sample: { size: 10 - recommended.length } },
        ]);
        // aggregate returns plain docs, convert to Book documents
        const moreDocs = await Book.find({
          _id: { $in: more.map((b: any) => b._id) },
        });
        recommended = recommended.concat(moreDocs);
      }
    } else {
      // General recommendations for anonymous users
      const randomBooks = await Book.aggregate([{ $sample: { size: 10 } }]);
      recommended = await Book.find({
        _id: { $in: randomBooks.map((b: any) => b._id) },
      });
    }

    res.json(recommended);
  } catch (err) {
    logger.error("Error fetching recommendations:", err);
    res.status(500).json({ message: "Error fetching recommendations" });
  }
});

export default router;
