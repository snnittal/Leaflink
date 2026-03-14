import React, { useEffect, useState } from "react";
import PageLayout from "../components/PageLayout";

interface OpenLibraryDoc {
  key: string;
  title: string;
  author_name?: string[];
  first_publish_year?: number;
  cover_i?: number;
}

interface OpenLibraryWorkDetails {
  description?: string | { value: string };
  first_sentence?: string | { value: string };
}

interface ArchiveDoc {
  identifier: string;
  title: string;
  creator?: string;
  year?: string;
}

const ExploreBooksPage: React.FC = () => {
  const [query, setQuery] = useState<string>("bestsellers");
  const [results, setResults] = useState<OpenLibraryDoc[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [selectedTitle, setSelectedTitle] = useState<string | null>(null);
  const [details, setDetails] = useState<OpenLibraryWorkDetails | null>(null);
  const [detailsLoading, setDetailsLoading] = useState<boolean>(false);
  const [detailsError, setDetailsError] = useState<string | null>(null);
  const [archiveResults, setArchiveResults] = useState<ArchiveDoc[]>([]);
  const [archiveLoading, setArchiveLoading] = useState<boolean>(false);
  const [archiveError, setArchiveError] = useState<string | null>(null);

  const searchBooks = async (event?: React.FormEvent) => {
    if (event) {
      event.preventDefault();
    }

    const trimmed = query.trim();
    if (!trimmed) {
      return;
    }

    setLoading(true);
    setError(null);
    setArchiveLoading(true);
    setArchiveError(null);

    try {
      const response = await fetch(
        `https://openlibrary.org/search.json?q=${encodeURIComponent(
          trimmed,
        )}&limit=20`,
      );

      if (!response.ok) {
        throw new Error("Failed to fetch books from Open Library");
      }

      const data = await response.json();
      setResults(Array.isArray(data.docs) ? data.docs : []);
      // Clear any previously selected details when running a new search
      setSelectedKey(null);
      setSelectedTitle(null);
      setDetails(null);
    } catch (err) {
      console.error("Open Library search error", err);
      setError("Could not load books from Open Library. Please try again.");
    } finally {
      setLoading(false);
    }

    try {
      const archiveQuery = `(${trimmed}) AND collection:(TeluguBooksFrom1891) AND mediatype:(texts)`;
      const archiveUrl = `https://archive.org/advancedsearch.php?q=${encodeURIComponent(
        archiveQuery,
      )}&output=json&rows=24&fl[]=identifier&fl[]=title&fl[]=creator&fl[]=year`;

      const response = await fetch(archiveUrl);
      if (!response.ok) {
        throw new Error("Failed to fetch books from Internet Archive");
      }

      const data = await response.json();
      const docs: any[] = data?.response?.docs ?? [];
      setArchiveResults(
        docs.map((d) => ({
          identifier: d.identifier as string,
          title: (d.title as string) ?? "Untitled",
          creator: (d.creator as string) ?? undefined,
          year: (d.year as string) ?? undefined,
        })),
      );
    } catch (err) {
      console.error("Internet Archive search error", err);
      setArchiveResults([]);
      setArchiveError(
        "Could not load Telugu classics from Internet Archive. Please try again.",
      );
    } finally {
      setArchiveLoading(false);
    }
  };

  const extractText = (field?: string | { value: string }): string | null => {
    if (!field) return null;
    if (typeof field === "string") return field;
    if (typeof field.value === "string") return field.value;
    return null;
  };

  const loadDetails = async (book: OpenLibraryDoc) => {
    setSelectedKey(book.key);
    setSelectedTitle(book.title);
    setDetails(null);
    setDetailsError(null);
    setDetailsLoading(true);

    try {
      const url = `https://openlibrary.org${book.key}.json`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Failed to fetch book details from Open Library");
      }

      const data: OpenLibraryWorkDetails = await response.json();
      setDetails(data);
    } catch (err) {
      console.error("Open Library details error", err);
      setDetailsError(
        "Could not load a summary for this book right now. Please try again.",
      );
    } finally {
      setDetailsLoading(false);
    }
  };

  // Run an initial search with the default query
  useEffect(() => {
    // Fire and forget; errors will be handled inside searchBooks
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    searchBooks();
    // We only want this to run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <PageLayout>
      <div>
        <h1 className="page-title">Explore Books</h1>
        <p className="page-subtitle">
          Discover books from the Open Library catalog. Search by title, author,
          or topic and browse what catches your eye.
        </p>

        <form onSubmit={searchBooks} style={{ marginBottom: "1.5rem" }}>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search millions of books..."
              className="form-input"
              style={{ flex: 1 }}
            />
            <button type="submit" className="btn btn-primary">
              Search
            </button>
          </div>
        </form>

        {loading && <div className="loading">Loading books...</div>}
        {error && <div className="error">{error}</div>}

        {!loading && !error && results.length === 0 && (
          <div className="card">
            <div className="card-content">
              No books found yet. Try a different search term.
            </div>
          </div>
        )}

        {!loading && !error && results.length > 0 && (
          <div className="explore-books-grid">
            {results.map((book) => {
              const authors = book.author_name?.join(", ") ?? "Unknown";
              const coverUrl =
                typeof book.cover_i === "number"
                  ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`
                  : null;
              return (
                <button
                  key={book.key}
                  type="button"
                  className="card explore-book-card"
                  onClick={() => loadDetails(book)}
                >
                  <div className="explore-book-card-inner">
                    {coverUrl ? (
                      <img
                        src={coverUrl}
                        alt={book.title}
                        className="explore-book-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="explore-book-placeholder">No cover</div>
                    )}
                    <div className="explore-book-info">
                      <div className="card-title">{book.title}</div>
                      <div className="card-content">
                        <div>By {authors}</div>
                        {book.first_publish_year && (
                          <div>First published: {book.first_publish_year}</div>
                        )}
                        {selectedKey === book.key && (
                          <div className="explore-book-inline-summary">
                            {detailsLoading && (
                              <div className="loading">Loading summary...</div>
                            )}
                            {detailsError && (
                              <div className="error">{detailsError}</div>
                            )}
                            {!detailsLoading && !detailsError && details && (
                              <>
                                {(() => {
                                  const descriptionText = extractText(
                                    details.description,
                                  );
                                  const firstSentenceText = extractText(
                                    details.first_sentence,
                                  );

                                  if (descriptionText) {
                                    return <p>{descriptionText}</p>;
                                  }

                                  if (firstSentenceText) {
                                    return <p>{firstSentenceText}</p>;
                                  }

                                  return (
                                    <p>
                                      No summary is available for this book yet.
                                      Try exploring another title.
                                    </p>
                                  );
                                })()}
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        <div style={{ marginTop: "2rem" }}>
          <h2 className="section-title">
            Classic Telugu Books (Internet Archive)
          </h2>
          <p className="page-subtitle">
            We also search the historic TeluguBooksFrom1891 collection on
            archive.org using the same query.
          </p>

          {archiveLoading && (
            <div className="loading">Loading Telugu classics...</div>
          )}
          {archiveError && <div className="error">{archiveError}</div>}

          {!archiveLoading && !archiveError && archiveResults.length === 0 && (
            <div className="card">
              <div className="card-content">
                No matching titles found in the TeluguBooksFrom1891 collection.
              </div>
            </div>
          )}

          {!archiveLoading && archiveResults.length > 0 && (
            <div className="explore-books-grid">
              {archiveResults.map((book) => {
                const coverUrl = `https://archive.org/services/img/${book.identifier}`;
                const author = book.creator ?? "Unknown";
                return (
                  <a
                    key={book.identifier}
                    href={`https://archive.org/details/${book.identifier}`}
                    target="_blank"
                    rel="noreferrer"
                    className="card explore-book-card"
                    style={{ textDecoration: "none" }}
                  >
                    <div className="explore-book-card-inner">
                      {coverUrl ? (
                        <img
                          src={coverUrl}
                          alt={book.title}
                          className="explore-book-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="explore-book-placeholder">No cover</div>
                      )}
                      <div className="explore-book-info">
                        <div className="card-title">{book.title}</div>
                        <div className="card-content">
                          <div>By {author}</div>
                          {book.year && <div>Year: {book.year}</div>}
                          <div style={{ marginTop: 4, fontSize: 12 }}>
                            Opens the full digitized book on archive.org
                          </div>
                        </div>
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
};

export default ExploreBooksPage;
