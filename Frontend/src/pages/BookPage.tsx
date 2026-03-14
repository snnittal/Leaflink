import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../api/client";
import PostCard from "../components/PostCard";
import logger from "../logger";
import PageLayout from "../components/PageLayout";

type Book = {
  _id: string;
  title: string;
  author: string;
  coverUrl?: string;
  description?: string;
};

type Post = {
  _id: string;
  content: string;
  rating?: number;
  createdAt: string;
  user: { name: string };
  book: { _id: string; title: string; author: string; coverUrl?: string };
  likes: string[];
  type?: "text" | "video";
  videoUrl?: string;
  thumbnailUrl?: string;
  durationSeconds?: number;
  textSummary?: string;
};

const BookPage: React.FC = () => {
  const { id } = useParams();
  const [book, setBook] = useState<Book | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [similarBooks, setSimilarBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;

      try {
        setLoading(true);

        // Fetch book details
        const bookResponse = await api.get(`/books/${id}`);
        setBook(bookResponse.data);

        // Fetch posts about this book
        const postsResponse = await api.get(`/posts/book/${id}`);
        setPosts(postsResponse.data.posts);

        // Fetch similar books
        const similarResponse = await api.get(`/books/${id}/similar`);
        setSimilarBooks(similarResponse.data);
      } catch (err) {
        logger.error("Error fetching book data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const toggleLike = async (postId: string) => {
    try {
      const { data } = await api.post(`/posts/${postId}/like`);
      setPosts((prev) => prev.map((p) => (p._id === data._id ? data : p)));
    } catch (err) {
      logger.error("Error toggling like:", err);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (!book) return <div className="error">Book not found</div>;

  return (
    <PageLayout>
      {/* Book Header */}
      <div className="book-header">
        <div className="book-cover-section">
          {book.coverUrl ? (
            <img src={book.coverUrl} alt={book.title} className="book-cover" />
          ) : (
            <div className="book-cover-placeholder">
              <span>No cover</span>
            </div>
          )}
        </div>
        <div className="book-info">
          <h1 className="book-title">{book.title}</h1>
          <p className="book-author">by {book.author}</p>
          {book.description && (
            <p className="book-description">{book.description}</p>
          )}
        </div>
      </div>

      {/* What Users Are Saying */}
      <div className="book-section">
        <h2 className="section-title">What Readers Are Saying</h2>
        {posts.length === 0 ? (
          <div className="empty-state">
            <p>No reviews yet. Be the first to share your thoughts!</p>
          </div>
        ) : (
          <div className="posts-list">
            {posts.map((post) => (
              <PostCard
                key={post._id}
                id={post._id}
                content={post.content}
                rating={post.rating}
                createdAt={post.createdAt}
                user={post.user}
                book={post.book}
                likesCount={post.likes.length}
                type={post.type}
                videoUrl={post.videoUrl}
                thumbnailUrl={post.thumbnailUrl}
                durationSeconds={post.durationSeconds}
                textSummary={post.textSummary}
                onLike={() => toggleLike(post._id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Similar Books */}
      {similarBooks.length > 0 && (
        <div className="book-section">
          <h2 className="section-title">Similar Books by {book.author}</h2>
          <div className="similar-books-grid">
            {similarBooks.map((similarBook) => (
              <a
                key={similarBook._id}
                href={`/books/${similarBook._id}`}
                className="similar-book-card"
              >
                {similarBook.coverUrl ? (
                  <img
                    src={similarBook.coverUrl}
                    alt={similarBook.title}
                    className="similar-book-cover"
                  />
                ) : (
                  <div className="similar-book-placeholder">
                    <span>No cover</span>
                  </div>
                )}
                <div className="similar-book-info">
                  <h3 className="similar-book-title">{similarBook.title}</h3>
                  <p className="similar-book-author">{similarBook.author}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </PageLayout>
  );
};

export default BookPage;
