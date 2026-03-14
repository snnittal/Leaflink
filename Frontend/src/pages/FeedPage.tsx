import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import PostCard from "../components/PostCard";
import { useAuth } from "../context/AuthContext";
import logger from "../logger";
import PageLayout from "../components/PageLayout";

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
  type?: "text" | "video";
  videoUrl?: string;
  thumbnailUrl?: string;
  durationSeconds?: number;
  textSummary?: string;
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
  const [postType, setPostType] = useState<"text" | "video">("text");
  const [content, setContent] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [duration, setDuration] = useState("");
  const [bookSearch, setBookSearch] = useState("");
  const [bookResults, setBookResults] = useState<Book[]>([]);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [booksLoading, setBooksLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const { data } = await api.get("/posts");
        setPosts(data.posts || data);
      } catch (err) {
        logger.error("Error fetching posts", err);
      }
    };

    fetchPosts();
  }, []);

  const filteredPosts = posts.filter((post) => {
    const q = search.toLowerCase();
    const title = post.book?.title?.toLowerCase() ?? "";
    const author = post.book?.author?.toLowerCase() ?? "";
    const content = post.content.toLowerCase();
    return title.includes(q) || author.includes(q) || content.includes(q);
  });

  const handleSearchBooks = async () => {
    if (!bookSearch.trim()) return;
    try {
      setBooksLoading(true);
      setCreateError(null);
      const { data } = await api.get<Book[]>("/books", {
        params: { q: bookSearch.trim() },
      });
      setBookResults(data);
    } catch (err) {
      logger.error("Error searching books", err);
      setCreateError("Could not search books. Please try again.");
    } finally {
      setBooksLoading(false);
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBook) {
      setCreateError("Please select a book before posting.");
      return;
    }
    if (!content.trim()) {
      setCreateError("Please add a short message about the book.");
      return;
    }
    if (postType === "video" && !videoUrl.trim()) {
      setCreateError("Please provide a video URL for your reaction.");
      return;
    }

    try {
      setCreating(true);
      setCreateError(null);

      const payload: any = {
        bookId: selectedBook._id,
        content: content.trim(),
      };

      if (postType === "video") {
        payload.type = "video";
        payload.videoUrl = videoUrl.trim();
        if (thumbnailUrl.trim()) payload.thumbnailUrl = thumbnailUrl.trim();
        const durationNumber = parseFloat(duration);
        if (!Number.isNaN(durationNumber) && durationNumber > 0) {
          payload.durationSeconds = durationNumber;
        }
      }

      const { data } = await api.post<Post>("/posts", payload);
      setPosts((prev) => [data, ...prev]);

      // Reset fields but keep the selected book so multiple posts are easy
      setContent("");
      setVideoUrl("");
      setThumbnailUrl("");
      setDuration("");
    } catch (err) {
      logger.error("Error creating post", err);
      setCreateError("Could not create post. Please try again.");
    } finally {
      setCreating(false);
    }
  };

  return (
    <PageLayout
      className="feed-page-container"
      left={null}
      right={
        !user ? (
          <div className="card">
            <h2 className="section-title">Join the Conversation</h2>
            <div className="login-prompt">
              <p>
                Love books? Create an account to share reviews, join clubs, and
                follow your favorite reads.
              </p>
              <a href="/login" className="login-link">
                Sign up or log in
              </a>
            </div>
          </div>
        ) : null
      }
    >
      {/* Quick Actions */}
      <div className="quick-actions">
        <Link to="/clubs" className="action-button">
          <span className="action-icon">👥</span>
          <span>Browse Clubs</span>
        </Link>
        <Link to="/explore" className="action-button">
          <span className="action-icon">📚</span>
          <span>Explore Books</span>
        </Link>
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
        <h2 className="section-title">Community Feed</h2>
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
              type={post.type}
              videoUrl={post.videoUrl}
              thumbnailUrl={post.thumbnailUrl}
              durationSeconds={post.durationSeconds}
              textSummary={post.textSummary}
              onLike={() => {}}
            />
          ))
        )}
      </div>

      {/* New Post area for logged-in users only */}
      {user && (
        <div id="post-form" className="feed-section">
          <h2 className="section-title">Share Your Thoughts</h2>
          <form onSubmit={handleCreatePost} style={{ marginTop: 12 }}>
            <div style={{ marginBottom: 8 }}>
              <span style={{ fontSize: 13, marginRight: 8 }}>Post type:</span>
              <button
                type="button"
                onClick={() => setPostType("text")}
                style={{
                  padding: "4px 10px",
                  marginRight: 6,
                  borderRadius: 12,
                  border:
                    postType === "text"
                      ? "2px solid #2563eb"
                      : "1px solid #ccc",
                  backgroundColor: postType === "text" ? "#eff6ff" : "#ffffff",
                  fontSize: 12,
                  cursor: "pointer",
                }}
              >
                Text
              </button>
              <button
                type="button"
                onClick={() => setPostType("video")}
                style={{
                  padding: "4px 10px",
                  borderRadius: 12,
                  border:
                    postType === "video"
                      ? "2px solid #2563eb"
                      : "1px solid #ccc",
                  backgroundColor: postType === "video" ? "#eff6ff" : "#ffffff",
                  fontSize: 12,
                  cursor: "pointer",
                }}
              >
                Video reaction
              </button>
            </div>

            <div style={{ marginBottom: 8 }}>
              <label
                style={{ display: "block", fontSize: 13, marginBottom: 4 }}
              >
                Search book by title
              </label>
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  type="text"
                  value={bookSearch}
                  onChange={(e) => setBookSearch(e.target.value)}
                  placeholder="e.g. The Great Gatsby"
                  style={{ flex: 1, padding: 6, fontSize: 13 }}
                />
                <button
                  type="button"
                  onClick={handleSearchBooks}
                  style={{
                    padding: "6px 12px",
                    fontSize: 13,
                    borderRadius: 9999,
                    border: "none",
                    backgroundColor: "#2563eb",
                    color: "white",
                    cursor: "pointer",
                  }}
                >
                  {booksLoading ? "Searching..." : "Search"}
                </button>
              </div>
              {selectedBook && (
                <div
                  style={{
                    marginTop: 6,
                    fontSize: 12,
                    color: "#555",
                  }}
                >
                  Selected: <strong>{selectedBook.title}</strong> by{" "}
                  {selectedBook.author}
                </div>
              )}
              {bookResults.length > 0 && (
                <div
                  style={{
                    marginTop: 6,
                    border: "1px solid #e5e7eb",
                    borderRadius: 6,
                    maxHeight: 180,
                    overflowY: "auto",
                    backgroundColor: "#fff",
                  }}
                >
                  {bookResults.map((b) => (
                    <button
                      key={b._id}
                      type="button"
                      onClick={() => {
                        setSelectedBook(b);
                        setBookResults([]);
                      }}
                      style={{
                        display: "block",
                        width: "100%",
                        textAlign: "left",
                        padding: "6px 8px",
                        fontSize: 13,
                        border: "none",
                        borderBottom: "1px solid #f3f4f6",
                        backgroundColor: "transparent",
                        cursor: "pointer",
                      }}
                    >
                      <strong>{b.title}</strong>{" "}
                      <span style={{ color: "#6b7280" }}>by {b.author}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div style={{ marginBottom: 8 }}>
              <label
                style={{ display: "block", fontSize: 13, marginBottom: 4 }}
              >
                What do you want to share?
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={3}
                style={{ width: "100%", padding: 6, fontSize: 13 }}
                placeholder={
                  postType === "video"
                    ? "Share a quick thought about this book to go with your video."
                    : "Share a short review or thought about this book."
                }
              />
            </div>

            {postType === "video" && (
              <div style={{ marginBottom: 8 }}>
                <label
                  style={{ display: "block", fontSize: 13, marginBottom: 4 }}
                >
                  Video URL
                </label>
                <input
                  type="url"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="Link to your short-form video (e.g. Cloudinary, S3, etc.)"
                  style={{ width: "100%", padding: 6, fontSize: 13 }}
                />
                <div style={{ marginTop: 6, display: "flex", gap: 8 }}>
                  <div style={{ flex: 1 }}>
                    <label
                      style={{
                        display: "block",
                        fontSize: 12,
                        marginBottom: 2,
                      }}
                    >
                      Thumbnail URL (optional)
                    </label>
                    <input
                      type="url"
                      value={thumbnailUrl}
                      onChange={(e) => setThumbnailUrl(e.target.value)}
                      style={{ width: "100%", padding: 6, fontSize: 12 }}
                    />
                  </div>
                  <div style={{ width: 140 }}>
                    <label
                      style={{
                        display: "block",
                        fontSize: 12,
                        marginBottom: 2,
                      }}
                    >
                      Duration (sec)
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      style={{ width: "100%", padding: 6, fontSize: 12 }}
                    />
                  </div>
                </div>
              </div>
            )}

            {createError && (
              <div style={{ color: "#b91c1c", fontSize: 12, marginBottom: 8 }}>
                {createError}
              </div>
            )}

            <button
              type="submit"
              disabled={creating}
              style={{
                marginTop: 4,
                padding: "8px 16px",
                fontSize: 14,
                borderRadius: 9999,
                border: "none",
                backgroundColor: creating ? "#9ca3af" : "#16a34a",
                color: "white",
                cursor: creating ? "default" : "pointer",
              }}
            >
              {creating
                ? "Posting..."
                : postType === "video"
                  ? "Post video reaction"
                  : "Post review"}
            </button>
          </form>
        </div>
      )}
    </PageLayout>
  );
};

export default FeedPage;
