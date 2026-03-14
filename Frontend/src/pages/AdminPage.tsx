import React, { useEffect, useState } from "react";
import { api } from "../api/client";

const AdminPage: React.FC = () => {
  // Book form state
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [description, setDescription] = useState("");
  const [bookMessage, setBookMessage] = useState("");

  // Club form state
  const [clubName, setClubName] = useState("");
  const [clubDescription, setClubDescription] = useState("");
  const [currentBookId, setCurrentBookId] = useState("");
  const [clubMessage, setClubMessage] = useState("");

  const [books, setBooks] = useState<any[]>([]);

  const fetchBooks = async () => {
    const { data } = await api.get("/books");
    setBooks(data);
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const createBook = async (e: React.FormEvent) => {
    e.preventDefault();
    setBookMessage("");
    try {
      await api.post("/books", { title, author, coverUrl, description });
      setBookMessage("Book created!");
      setTitle("");
      setAuthor("");
      setCoverUrl("");
      setDescription("");
      await fetchBooks();
    } catch (err: any) {
      setBookMessage(err?.response?.data?.message || "Error creating book");
    }
  };

  const createClub = async (e: React.FormEvent) => {
    e.preventDefault();
    setClubMessage("");
    try {
      await api.post("/clubs", {
        name: clubName,
        description: clubDescription,
        currentBookId: currentBookId || undefined
      });
      setClubMessage("Club created!");
      setClubName("");
      setClubDescription("");
      setCurrentBookId("");
    } catch (err: any) {
      setClubMessage(err?.response?.data?.message || "Error creating club");
    }
  };

  return (
    <div style={{ maxWidth: 800, margin: "16px auto", padding: "0 8px" }}>
      <h2>Admin Panel</h2>

      {/* Create Book */}
      <section style={{ marginTop: 16, marginBottom: 24 }}>
        <h3>Create Book</h3>
        <form onSubmit={createBook}>
          <div style={{ marginBottom: 8 }}>
            <label style={{ fontSize: 12 }}>Title</label>
            <input
              style={{ width: "100%", padding: 6, marginTop: 2 }}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div style={{ marginBottom: 8 }}>
            <label style={{ fontSize: 12 }}>Author</label>
            <input
              style={{ width: "100%", padding: 6, marginTop: 2 }}
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              required
            />
          </div>
          <div style={{ marginBottom: 8 }}>
            <label style={{ fontSize: 12 }}>Cover URL (optional)</label>
            <input
              style={{ width: "100%", padding: 6, marginTop: 2 }}
              value={coverUrl}
              onChange={(e) => setCoverUrl(e.target.value)}
            />
          </div>
          <div style={{ marginBottom: 8 }}>
            <label style={{ fontSize: 12 }}>Description (optional)</label>
            <textarea
              style={{ width: "100%", padding: 6, marginTop: 2 }}
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <button type="submit" style={{ padding: "6px 10px", fontSize: 13 }}>
            Create Book
          </button>
          {bookMessage && (
            <div style={{ fontSize: 12, marginTop: 6 }}>{bookMessage}</div>
          )}
        </form>
      </section>

      {/* Create Club */}
      <section style={{ marginTop: 16 }}>
        <h3>Create Club</h3>
        <form onSubmit={createClub}>
          <div style={{ marginBottom: 8 }}>
            <label style={{ fontSize: 12 }}>Club Name</label>
            <input
              style={{ width: "100%", padding: 6, marginTop: 2 }}
              value={clubName}
              onChange={(e) => setClubName(e.target.value)}
              required
            />
          </div>
          <div style={{ marginBottom: 8 }}>
            <label style={{ fontSize: 12 }}>Description (optional)</label>
            <textarea
              style={{ width: "100%", padding: 6, marginTop: 2 }}
              rows={3}
              value={clubDescription}
              onChange={(e) => setClubDescription(e.target.value)}
            />
          </div>
          <div style={{ marginBottom: 8 }}>
            <label style={{ fontSize: 12 }}>Current Book (optional)</label>
            <select
              style={{ width: "100%", padding: 6, marginTop: 2 }}
              value={currentBookId}
              onChange={(e) => setCurrentBookId(e.target.value)}
            >
              <option value="">None</option>
              {books.map((b) => (
                <option key={b._id} value={b._id}>
                  {b.title} — {b.author}
                </option>
              ))}
            </select>
          </div>
          <button type="submit" style={{ padding: "6px 10px", fontSize: 13 }}>
            Create Club
          </button>
          {clubMessage && (
            <div style={{ fontSize: 12, marginTop: 6 }}>{clubMessage}</div>
          )}
        </form>
      </section>
    </div>
  );
};

export default AdminPage;
