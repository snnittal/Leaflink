import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import logger from "../logger";
import PageLayout from "../components/PageLayout";

type Club = {
  _id: string;
  name: string;
  description?: string;
  members?: { name: string }[];
  currentBook?: { title: string; author: string };
};

const ClubsPage: React.FC = () => {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState("");

  const fetchClubs = async (query?: string) => {
    try {
      setLoading(true);
      const { data } = await api.get("/clubs", {
        params: query ? { q: query } : {},
      });
      setClubs(data);
    } catch (err) {
      logger.error("Error fetching clubs", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClubs();
  }, []);

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchClubs(q.trim() || undefined);
  };

  return (
    <PageLayout>
      <h2 className="page-title">Clubs</h2>

      <form
        onSubmit={onSearch}
        style={{ marginBottom: 12, display: "flex", gap: 8 }}
      >
        <input
          style={{ flex: 1, padding: 6 }}
          placeholder="Search clubs by name..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <button type="submit" style={{ padding: "6px 10px", fontSize: 13 }}>
          Search
        </button>
      </form>

      {loading ? (
        <div>Loading...</div>
      ) : clubs.length === 0 ? (
        <div style={{ fontSize: 13, color: "#777" }}>No clubs found.</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {clubs.map((club) => (
            <div
              key={club._id}
              style={{
                border: "1px solid #eee",
                borderRadius: 8,
                padding: 10,
              }}
            >
              <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>
                {club.name}
              </div>
              {club.description && (
                <div
                  style={{
                    fontSize: 13,
                    color: "#555",
                    marginBottom: 4,
                  }}
                >
                  {club.description}
                </div>
              )}
              {club.currentBook && (
                <div style={{ fontSize: 12, color: "#666", marginBottom: 4 }}>
                  Current book: <strong>{club.currentBook.title}</strong> by{" "}
                  {club.currentBook.author}
                </div>
              )}
              <div style={{ fontSize: 12, color: "#888", marginBottom: 6 }}>
                Members: {club.members?.length ?? 0}
              </div>
              <Link
                to={`/clubs/${club._id}`}
                style={{ fontSize: 13, textDecoration: "underline" }}
              >
                Open club
              </Link>
            </div>
          ))}
        </div>
      )}
    </PageLayout>
  );
};

export default ClubsPage;
