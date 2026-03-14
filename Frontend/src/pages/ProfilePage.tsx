import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import logger from "../logger";
import PageLayout from "../components/PageLayout";

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
  const [theme, setTheme] = useState<"classic" | "scrapbook">("classic");

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

  useEffect(() => {
    try {
      const saved = localStorage.getItem("profileTheme");
      if (saved === "classic" || saved === "scrapbook") {
        setTheme(saved);
      }
    } catch {
      // ignore
    }
  }, []);

  if (loading || !overview) {
    return (
      <PageLayout>
        <div style={{ maxWidth: 900, margin: "16px auto", padding: "0 8px" }}>
          <h2>Profile</h2>
          <div>Loading...</div>
        </div>
      </PageLayout>
    );
  }

  const { user, posts, likedBooks, clubs } = overview;

  const isScrapbook = theme === "scrapbook";
  const pageBackground = isScrapbook ? "#fdf7ec" : "#ffffff";
  const pagePattern = isScrapbook
    ? "radial-gradient(#f2e9d6 1px, transparent 0)"
    : "none";
  const pagePatternSize = isScrapbook ? "14px 14px" : "auto";

  return (
    <PageLayout>
      <div
        style={{
          maxWidth: 900,
          margin: "16px auto",
          padding: "16px 12px 24px",
          borderRadius: 16,
          backgroundColor: pageBackground,
          backgroundImage: pagePattern,
          backgroundSize: pagePatternSize,
          border: isScrapbook ? "1px solid #f3e3c5" : "none",
        }}
      >
        {/* Header */}
        <div
          style={{
            border: "1px solid #e5e7eb",
            borderRadius: 14,
            padding: 16,
            marginBottom: 20,
            backgroundColor: isScrapbook ? "#fffdf7" : "#ffffff",
            boxShadow: isScrapbook
              ? "0 6px 12px rgba(148, 120, 80, 0.18)"
              : "0 2px 6px rgba(15, 23, 42, 0.05)",
            transform: isScrapbook ? "rotate(-0.8deg)" : "none",
            position: "relative",
          }}
        >
          {isScrapbook && (
            <div
              style={{
                position: "absolute",
                top: -10,
                left: 32,
                width: 70,
                height: 18,
                background:
                  "linear-gradient(135deg, rgba(254,240,199,0.9), rgba(248,250,252,0.9))",
                borderRadius: 4,
                boxShadow: "0 3px 4px rgba(0,0,0,0.12)",
              }}
            />
          )}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: "9999px",
                  background:
                    "linear-gradient(135deg, #4f46e5, #ec4899, #f97316)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontWeight: 700,
                  fontSize: 20,
                  textTransform: "uppercase",
                }}
              >
                {user.name?.charAt(0) ?? "?"}
              </div>
              <div>
                <h2 style={{ margin: 0 }}>{user.name}</h2>
                <p style={{ fontSize: 13, color: "#666", marginTop: 2 }}>
                  {user.email}
                </p>
                {isSelf && (
                  <p style={{ fontSize: 12, color: "#999", marginTop: 2 }}>
                    This is your reading scrapbook.
                  </p>
                )}
              </div>
            </div>
            {isSelf && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-end",
                  gap: 4,
                }}
              >
                <span
                  style={{
                    fontSize: 11,
                    color: "#6b7280",
                    textTransform: "uppercase",
                    letterSpacing: 0.06,
                  }}
                >
                  Profile theme
                </span>
                <div style={{ display: "flex", gap: 4 }}>
                  <button
                    type="button"
                    onClick={() => {
                      setTheme("classic");
                      try {
                        localStorage.setItem("profileTheme", "classic");
                      } catch {
                        // ignore
                      }
                    }}
                    style={{
                      padding: "4px 10px",
                      fontSize: 11,
                      borderRadius: 9999,
                      border:
                        theme === "classic"
                          ? "2px solid #4f46e5"
                          : "1px solid #d1d5db",
                      backgroundColor:
                        theme === "classic" ? "#eef2ff" : "#ffffff",
                      cursor: "pointer",
                    }}
                  >
                    Classic
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTheme("scrapbook");
                      try {
                        localStorage.setItem("profileTheme", "scrapbook");
                      } catch {
                        // ignore
                      }
                    }}
                    style={{
                      padding: "4px 10px",
                      fontSize: 11,
                      borderRadius: 9999,
                      border:
                        theme === "scrapbook"
                          ? "2px solid #f97316"
                          : "1px solid #d1d5db",
                      backgroundColor:
                        theme === "scrapbook" ? "#fff7ed" : "#ffffff",
                      cursor: "pointer",
                    }}
                  >
                    Scrapbook
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Layout: posts + sidebar */}
        <div style={{ display: "flex", flexDirection: "row", gap: 16 }}>
          {/* Posts */}
          <div style={{ flex: 2 }}>
            <h3 style={{ marginBottom: 4 }}>Reading timeline</h3>
            <p style={{ fontSize: 12, color: "#6b7280", marginTop: 0 }}>
              A running log of your thoughts and reviews.
            </p>
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
                    border: "1px solid #e5e7eb",
                    borderRadius: 10,
                    padding: 10,
                    marginBottom: 10,
                    backgroundColor: isScrapbook ? "#ffffff" : "#f9fafb",
                    boxShadow: isScrapbook
                      ? "0 3px 6px rgba(148, 120, 80, 0.08)"
                      : "none",
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
                  <div style={{ fontSize: 13, marginBottom: 4 }}>
                    {p.content}
                  </div>
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
                border: "1px solid #e5e7eb",
                borderRadius: 10,
                padding: 10,
                backgroundColor: isScrapbook ? "#fffdf7" : "#ffffff",
                boxShadow: isScrapbook
                  ? "0 4px 8px rgba(148, 120, 80, 0.12)"
                  : "none",
                marginBottom: 16,
              }}
            >
              <h4 style={{ marginTop: 0, marginBottom: 4 }}>
                Favorites moodboard
              </h4>
              <p style={{ fontSize: 11, color: "#6b7280", marginTop: 0 }}>
                Books you liked, arranged like a little shelf.
              </p>
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
                        border: "1px solid #e5e7eb",
                        borderRadius: 8,
                        padding: 6,
                        fontSize: 12,
                        backgroundColor: "#ffffff",
                        boxShadow: isScrapbook
                          ? "0 2px 4px rgba(148, 120, 80, 0.12)"
                          : "none",
                        transform: isScrapbook
                          ? "rotate(" +
                            (Math.random() * 2 - 1).toFixed(2) +
                            "deg)"
                          : "none",
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
                border: "1px solid #e5e7eb",
                borderRadius: 10,
                padding: 10,
                backgroundColor: isScrapbook ? "#fffdf7" : "#ffffff",
                boxShadow: isScrapbook
                  ? "0 4px 8px rgba(148, 120, 80, 0.12)"
                  : "none",
              }}
            >
              <h4 style={{ marginTop: 0, marginBottom: 4 }}>Clubs</h4>
              <p style={{ fontSize: 11, color: "#6b7280", marginTop: 0 }}>
                Places where you read and discuss together.
              </p>
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
                        <div style={{ color: "#aaa" }}>
                          Owner: {c.owner.name}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default ProfilePage;
