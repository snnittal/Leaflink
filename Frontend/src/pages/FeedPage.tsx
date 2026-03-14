import React, { useEffect, useState } from "react";
import { api } from "../api/client";
import PostCard from "../components/PostCard";
import { useAuth } from "../context/AuthContext";
import logger from "../logger";
import Sidebar from "../components/Sidebar";

type Post = {
  _id: string;
  content: string;
  rating?: number;
  createdAt: string;
  user: { name: string };
  book?: {
    _id: string;
    title: string;
    author: string;
    coverUrl?: string;
  } | null;
  likes: string[];
};

type Book = {
  _id: string;
  title: string;
  author: string;
  coverUrl?: string;
};

const FeedPage: React.FC = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [search, setSearch] = useState("");
  const [recommendedBooks, setRecommendedBooks] = useState<Book[]>([]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const { data } = await api.get("/posts");
        setPosts(data.posts || data);
      } catch (err) {
        logger.error("Error fetching posts", err);
      }
    };

    const fetchRecommendations = async () => {
      try {
        const { data } = await api.get("/recommendations/books");
        setRecommendedBooks(data || []);
      } catch (err) {
        logger.error("Error fetching recommendations", err);
      }
    };

    fetchPosts();
    fetchRecommendations();
  }, []);

  const filteredPosts = posts.filter((post) => {
    const q = search.toLowerCase();
    const title = post.book?.title?.toLowerCase() ?? "";
    const author = post.book?.author?.toLowerCase() ?? "";
    const content = post.content.toLowerCase();
    return title.includes(q) || author.includes(q) || content.includes(q);
  });

  return (
    <div className="feed-page-container">
      <div className="three-column-layout">
        <div className="three-col-left">
          <Sidebar />
        </div>

        <div className="three-col-middle">
          {/* Quick Actions */}
          <div className="quick-actions">
            <a href="/clubs" className="action-button">
              <span className="action-icon">👥</span>
              <span>Browse Clubs</span>
            </a>
            <a href="/books" className="action-button">
              <span className="action-icon">📚</span>
              <span>Explore Books</span>
            </a>
          </div>

          {/* Search bar */}
          <div className="search-section">
            <input
              className="search-input"
              placeholder="Search posts by book title, author, or content..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Feed of Posts */}
          <div className="feed-section">
            {filteredPosts.length === 0 ? (
              <div className="no-posts">No posts to display.</div>
            ) : (
              filteredPosts.map((post) => (
                <PostCard
                  key={post._id}
                  id={post._id}
                  content={post.content}
                  rating={post.rating}
                  createdAt={post.createdAt}
                  user={post.user}
                  book={
                    post.book ?? {
                      _id: "",
                      title: "Unknown",
                      author: "",
                      coverUrl: "",
                    }
                  }
                  likesCount={post.likes?.length ?? 0}
                  onLike={() => {}}
                />
              ))
            )}
          </div>

          {/* New Post / Login Prompt */}
          <div id="post-form" className="feed-section">
            {user ? (
              <>
                <h2 className="section-title">Share Your Thoughts</h2>
                <p>Posting form coming soon.</p>
              </>
            ) : (
              <>
                <h2 className="section-title">Join the Conversation</h2>
                <div className="login-prompt">
                  <p>Want to share your thoughts about books?</p>
                  <a href="/login" className="login-link">
                    Sign in to post reviews
                  </a>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="three-col-right">
          <div className="card">
            <h2 className="section-title">Books you may be interested in</h2>
            {recommendedBooks.length === 0 ? (
              <p className="page-subtitle">
                Keep reading and posting to get personalized recommendations.
              </p>
            ) : (
              <div className="recommended-books">
                {recommendedBooks.map((book) => (
                  <a
                    key={book._id}
                    href={`/books/${book._id}`}
                    className="book-card"
                  >
                    {book.coverUrl ? (
                      <img
                        src={book.coverUrl}
                        alt={book.title}
                        className="book-cover"
                      />
                    ) : (
                      <div className="book-cover-placeholder">
                        No cover available
                      </div>
                    )}
                    <div className="book-info">
                      <div className="card-title">{book.title}</div>
                      <div className="card-content">{book.author}</div>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedPage;
