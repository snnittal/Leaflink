import React, { useEffect, useState } from "react";
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
                Love books? Create an account to share reviews, join
                clubs, and follow your favorite reads.
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
              onLike={() => {}}
            />
          ))
        )}
      </div>

      {/* New Post area for logged-in users only */}
      {user && (
        <div id="post-form" className="feed-section">
          <h2 className="section-title">Share Your Thoughts</h2>
          <p>Posting form coming soon.</p>
        </div>
      )}
    </PageLayout>
  );
};

export default FeedPage;
