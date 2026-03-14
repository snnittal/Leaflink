import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import logger from "../logger";

type Book = {
  _id: string;
  title: string;
  author: string;
  coverUrl?: string;
};

type Post = {
  _id: string;
  content: string;
  rating?: number;
  createdAt: string;
  book?: Book;
};

type Club = {
  _id: string;
  name: string;
  description?: string;
  owner?: { name: string };
  currentBook?: { title: string; author: string };
};

type ProfileOverview = {
  user: { id: string; name: string; email: string };
  posts: Post[];
  likedBooks: Book[];
  clubs: Club[];
};

const ProfilePage: React.FC = () => {
  const { id: routeUserId } = useParams();
  const { user: currentUser } = useAuth();
  const [overview, setOverview] = useState<ProfileOverview | null>(null);
  const [loading, setLoading] = useState(false);

  const isSelf = !routeUserId || routeUserId === currentUser?.id;
  const targetUserId = routeUserId || currentUser?.id;

  useEffect(() => {
    const fetchOverview = async () => {
      if (!targetUserId && !isSelf) return;
      setLoading(true);
      try {
        const url = isSelf
          ? "/users/me/overview"
          : `/users/${routeUserId}/overview`;
        const { data } = await api.get(url);
        setOverview(data);
      } catch (err) {
        logger.error("Error fetching profile overview", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOverview();
  }, [isSelf, routeUserId, targetUserId]);

  if (loading || !overview) {
    return (
      <div style={{ maxWidth: 900, margin: "16px auto", padding: "0 8px" }}>
        <h2>Profile</h2>
        <div>Loading...</div>
      </div>
    );
  }

  const { user, posts, likedBooks, clubs } = overview;

  return (
    <div style={{ maxWidth: 900, margin: "16px auto", padding: "0 8px" }}>
      {/* Header */}
      <div
        style={{
          border: "1px solid #eee",
          borderRadius: 10,
          padding: 16,
          marginBottom: 20,
        }}
      >
        <h2 style={{ margin: 0 }}>{user.name}</h2>
        <p style={{ fontSize: 13, color: "#666", marginTop: 4 }}>
          {user.email}
        </p>
        {isSelf && (
          <p style={{ fontSize: 12, color: "#999", marginTop: 4 }}>
            This is your profile.
          </p>
        )}
      </div>

      {/* Layout: posts + sidebar */}
      <div style={{ display: "flex", flexDirection: "row", gap: 16 }}>
        {/* Posts */}
        <div style={{ flex: 2 }}>
          <h3 style={{ marginBottom: 8 }}>Posts</h3>
          {posts.length === 0 ? (
            <div style={{ fontSize: 13, color: "#777" }}>
              {isSelf
                ? "You haven't posted anything yet."
                : "No posts from this user yet."}
            </div>
          ) : (
            posts.map((p) => (
              <div
                key={p._id}
                style={{
                  border: "1px solid #eee",
                  borderRadius: 8,
                  padding: 10,
                  marginBottom: 10,
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    color: "#888",
                    marginBottom: 4,
                  }}
                >
                  {new Date(p.createdAt).toLocaleString()}
                </div>
                {p.book && (
                  <div style={{ fontSize: 13, marginBottom: 4 }}>
                    On <strong>{p.book.title}</strong> by {p.book.author}
                  </div>
                )}
                <div style={{ fontSize: 13, marginBottom: 4 }}>{p.content}</div>
                {p.rating !== undefined && (
                  <div style={{ fontSize: 12 }}>Rating: {p.rating}/5</div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Sidebar: liked books + clubs */}
        <div style={{ flex: 1 }}>
          {/* Liked books */}
          <div
            style={{
              border: "1px solid #eee",
              borderRadius: 8,
              padding: 10,
              marginBottom: 16,
            }}
          >
            <h4 style={{ marginTop: 0, marginBottom: 8 }}>Liked books</h4>
            {likedBooks.length === 0 ? (
              <div style={{ fontSize: 12, color: "#777" }}>
                {isSelf
                  ? "You haven't liked any posts yet."
                  : "No liked books to show."}
              </div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(90px, 1fr))",
                  gap: 8,
                }}
              >
                {likedBooks.map((b) => (
                  <div
                    key={b._id}
                    style={{
                      border: "1px solid #eee",
                      borderRadius: 6,
                      padding: 6,
                      fontSize: 12,
                    }}
                  >
                    {b.coverUrl && (
                      <img
                        src={b.coverUrl}
                        alt={b.title}
                        style={{
                          width: "100%",
                          height: 110,
                          objectFit: "cover",
                          borderRadius: 4,
                          marginBottom: 4,
                        }}
                      />
                    )}
                    <div style={{ fontWeight: 600 }}>{b.title}</div>
                    <div style={{ color: "#666" }}>{b.author}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Clubs */}
          <div
            style={{
              border: "1px solid #eee",
              borderRadius: 8,
              padding: 10,
            }}
          >
            <h4 style={{ marginTop: 0, marginBottom: 8 }}>Clubs</h4>
            {clubs.length === 0 ? (
              <div style={{ fontSize: 12, color: "#777" }}>
                {isSelf
                  ? "You haven't joined any clubs yet."
                  : "No clubs to show."}
              </div>
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                }}
              >
                {clubs.map((c) => (
                  <div
                    key={c._id}
                    style={{
                      border: "1px solid #eee",
                      borderRadius: 6,
                      padding: 6,
                      fontSize: 12,
                    }}
                  >
                    <div style={{ fontWeight: 600, marginBottom: 2 }}>
                      {c.name}
                    </div>
                    {c.description && (
                      <div
                        style={{
                          color: "#666",
                          marginBottom: 2,
                        }}
                      >
                        {c.description}
                      </div>
                    )}
                    {c.currentBook && (
                      <div style={{ color: "#999", marginBottom: 2 }}>
                        Current book: {c.currentBook.title} by{" "}
                        {c.currentBook.author}
                      </div>
                    )}
                    {c.owner && (
                      <div style={{ color: "#aaa" }}>Owner: {c.owner.name}</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
