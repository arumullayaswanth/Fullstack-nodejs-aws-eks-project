import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import API_BASE_URL from "./config";

const Books = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAllBooks = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/books`);
      setBooks(res.data || []);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Could not load books right now.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllBooks();
  }, [fetchAllBooks]);

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/books/${id}`);
      setBooks((prev) => prev.filter((b) => b.id !== id));
    } catch (err) {
      console.error(err);
      setError("Delete failed. Try again.");
    }
  };

  return (
    <div className="shell">
      <div className="topbar">
        <div className="brand">
          <div className="brand-mark">YA</div>
          <div>
            <div className="brand-text">Yash Academic</div>
            <div className="pill-row">
              <span className="pill">Catalog</span>
              <span className="pill">Curation</span>
              <span className="pill">Orders</span>
            </div>
          </div>
        </div>
        <div className="pill-row">
          <Link to="/add">
            <button className="btn primary">Add a title</button>
          </Link>
          <button className="btn secondary" onClick={fetchAllBooks} disabled={loading}>
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </div>

      <section className="hero">
        <div className="hero-card">
          <div className="eyebrow">Yash Academic</div>
          <h1>Serious books, striking presentation.</h1>
          <p className="lede">
            A refined back-office for your bookstore. Review, edit, and publish titles with a single tap.
          </p>
          <div className="hero-actions">
            <Link to="/add">
              <button className="btn primary">Add a title</button>
            </Link>
            <button className="btn secondary" onClick={fetchAllBooks} disabled={loading}>
              {loading ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </div>
        <div className="stat-card">
          <div className="eyebrow">Titles live</div>
          <div className="stat-value">{books.length}</div>
          <div className="stat-label">Curated for readers</div>
        </div>
      </section>

      {error && <div className="empty" style={{ borderStyle: "solid" }}>{error}</div>}

      {loading ? (
        <div className="books-grid">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div key={idx} className="book-card" style={{ opacity: 0.5 }}>
              <div className="cover-wrap" style={{ height: 170, background: "rgba(255,255,255,0.04)" }} />
              <div className="book-title" style={{ background: "rgba(255,255,255,0.05)", height: 18, width: "70%" }} />
              <div className="book-desc" style={{ background: "rgba(255,255,255,0.03)", height: 48 }} />
            </div>
          ))}
        </div>
      ) : books.length ? (
        <div className="books-grid">
          {books.map((book) => (
            <article key={book.id} className="book-card">
              <div className="cover-wrap">
                <img src={book.cover} alt={book.title} />
                <span className="price-chip">${Number(book.price).toFixed(2)}</span>
              </div>
              <div className="book-title">{book.title}</div>
              <p className="book-desc">{book.desc}</p>
              <div className="card-actions">
                <button className="btn ghost danger" onClick={() => handleDelete(book.id)}>
                  Delete
                </button>
                <Link to={`/update/${book.id}`}>
                  <button className="btn ghost">Edit</button>
                </Link>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="empty">
          Nothing on the shelf yet. Start Yash Academic with a fresh title.
          <div style={{ marginTop: 12 }}>
            <Link to="/add">
              <button className="btn primary">Add your first book</button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default Books;
