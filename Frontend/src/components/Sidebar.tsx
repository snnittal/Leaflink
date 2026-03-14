import React, { useEffect, useState } from "react";
import { api } from "../api/client";
import logger from "../logger";

type Book = {
  _id: string;
  title: string;
  author: string;
  coverUrl?: string;
};

type Club = {
  _id: string;
  name: string;
  description?: string;
  members?: { name: string }[];
};

const Sidebar: React.FC = () => {
  const [trendingBooks, setTrendingBooks] = useState<Book[]>([]);
  const [popularClubs, setPopularClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSidebarData = async () => {
      try {
        // Fetch trending/popular books (you might want to add an endpoint for this)
        const booksResponse = await api.get("/books?limit=5");
        setTrendingBooks(booksResponse.data.slice(0, 5));

        // Fetch popular clubs
        const clubsResponse = await api.get("/clubs");
        // Sort by member count and take top 5
        const sortedClubs = clubsResponse.data
          .sort(
            (a: Club, b: Club) =>
              (b.members?.length || 0) - (a.members?.length || 0),
          )
          .slice(0, 5);
        setPopularClubs(sortedClubs);
      } catch (err) {
        logger.error("Error fetching sidebar data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSidebarData();
  }, []);

  if (loading) {
    return (
      <div className="sidebar-loading">
        <div className="sidebar-section">
          <h3>Loading...</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="sidebar">
      {/* Popular Clubs */}
      <div className="sidebar-section">
        <h3 className="sidebar-title">Popular Clubs</h3>
        <div className="sidebar-list">
          {popularClubs.slice(0, 3).map((club) => (
            <a
              key={club._id}
              href={`/clubs/${club._id}`}
              className="sidebar-item"
            >
              <div className="sidebar-item-title">{club.name}</div>
              <div className="sidebar-item-subtitle">
                {club.members?.length || 0} members
              </div>
            </a>
          ))}
        </div>
        <a href="/clubs" className="sidebar-link">
          View all clubs →
        </a>
      </div>

      {/* Trending Books */}
      <div className="sidebar-section">
        <h3 className="sidebar-title">Trending Books</h3>
        <div className="sidebar-list">
          {trendingBooks.slice(0, 3).map((book) => (
            <a
              key={book._id}
              href={`/books/${book._id}`}
              className="sidebar-item"
            >
              {book.coverUrl ? (
                <img
                  src={book.coverUrl}
                  alt={book.title}
                  className="sidebar-book-cover"
                />
              ) : (
                <div className="sidebar-book-placeholder">
                  <span>No cover</span>
                </div>
              )}
              <div className="sidebar-item-content">
                <div className="sidebar-item-title">{book.title}</div>
                <div className="sidebar-item-subtitle">{book.author}</div>
              </div>
            </a>
          ))}
        </div>
        <a href="/books" className="sidebar-link">
          Browse all books →
        </a>
      </div>

      {/* Community Guidelines */}
      <div className="sidebar-section">
        <h3 className="sidebar-title">Community</h3>
        <div className="sidebar-content">
          <p>
            Welcome to LeafLink! Share your thoughts on books, join discussion
            clubs, and discover new reads.
          </p>
          <ul>
            <li>Be respectful in discussions</li>
            <li>Share your genuine opinions</li>
            <li>Help others discover great books</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
