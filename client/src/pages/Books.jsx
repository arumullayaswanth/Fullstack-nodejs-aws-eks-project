import React, { useEffect, useMemo, useState, useCallback } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import API_BASE_URL from "./config";
import SocialLinks from "../components/SocialLinks";

const META_KEY = "ya_book_meta_v1";
const REVIEWS_KEY = "ya_book_reviews_v1";
const CART_KEY = "ya_cart_v1";

const FALLBACK_COVER =
  "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=1200&q=80";

const randomFromId = (id, min, max) => {
  const seed = Number(id || 1) * 9301 + 49297;
  const rnd = (seed % 233280) / 233280;
  return Math.floor(min + rnd * (max - min + 1));
};

const toCurrency = (value) => {
  const num = Number(value || 0);
  return num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const toValidPrice = (value) => {
  const num = Number(value);
  if (!Number.isFinite(num) || num < 0) return null;
  if (num > 5000) return null;
  return num;
};

const guessCategory = (book) => {
  const text = `${book.title || ""} ${book.desc || ""}`.toLowerCase();
  if (text.includes("cloud") || text.includes("aws") || text.includes("kubernetes")) return "Cloud";
  if (text.includes("devops")) return "DevOps";
  if (text.includes("data") || text.includes("sql")) return "Data";
  if (text.includes("design") || text.includes("ui") || text.includes("ux")) return "Design";
  return "Technology";
};

const guessTags = (book) => {
  const text = `${book.title || ""} ${book.desc || ""}`.toLowerCase();
  const tags = [];
  if (text.includes("aws")) tags.push("AWS");
  if (text.includes("devops")) tags.push("DevOps");
  if (text.includes("cloud")) tags.push("Cloud");
  if (text.includes("docker")) tags.push("Docker");
  if (text.includes("kubernetes") || text.includes("k8s")) tags.push("Kubernetes");
  if (!tags.length) tags.push("General");
  return tags;
};

const readStorage = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const writeStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore storage errors in private mode
  }
};

const Books = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState("latest");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const [meta, setMeta] = useState(() => readStorage(META_KEY, {}));
  const [reviews, setReviews] = useState(() => readStorage(REVIEWS_KEY, {}));
  const [cart, setCart] = useState(() => readStorage(CART_KEY, []));

  const [selected, setSelected] = useState({});
  const [bulkPercent, setBulkPercent] = useState("");

  const [quickView, setQuickView] = useState(null);
  const [reviewForm, setReviewForm] = useState({ name: "", stars: 5, text: "" });

  const [editingId, setEditingId] = useState(null);
  const [editDraft, setEditDraft] = useState({ title: "", desc: "", price: "", cover: "" });

  useEffect(() => writeStorage(META_KEY, meta), [meta]);
  useEffect(() => writeStorage(REVIEWS_KEY, reviews), [reviews]);
  useEffect(() => writeStorage(CART_KEY, cart), [cart]);

  const fetchAllBooks = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/books`);
      const list = res.data || [];
      setBooks(list);
      setError(null);

      setMeta((prev) => {
        const next = { ...prev };
        list.forEach((book) => {
          if (!next[book.id]) {
            next[book.id] = {
              category: guessCategory(book),
              tags: guessTags(book),
              rating: randomFromId(book.id, 3, 5),
              favorite: false,
              stock: randomFromId(book.id, 2, 40),
            };
          }
        });
        return next;
      });
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

  const handleImageError = (event) => {
    if (event.currentTarget.src !== FALLBACK_COVER) {
      event.currentTarget.src = FALLBACK_COVER;
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/books/${id}`);
      setBooks((prev) => prev.filter((b) => b.id !== id));
      setSelected((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      if (quickView && quickView.id === id) setQuickView(null);
    } catch (err) {
      console.error(err);
      setError("Delete failed. Try again.");
    }
  };

  const handleShare = async (book) => {
    const shareText = `Check out ${book.title} at Yash Academic - $${toCurrency(book.price)}`;
    try {
      await navigator.clipboard.writeText(shareText);
      setError("Copied share text to clipboard.");
      setTimeout(() => setError(null), 1800);
    } catch {
      setError("Clipboard unavailable. You can manually share this title.");
      setTimeout(() => setError(null), 1800);
    }
  };

  const toggleFavorite = (bookId) => {
    setMeta((prev) => ({
      ...prev,
      [bookId]: {
        ...prev[bookId],
        favorite: !prev[bookId]?.favorite,
      },
    }));
  };

  const addToCart = (book) => {
    setCart((prev) => [...prev, { id: book.id, title: book.title, price: Number(book.price || 0) }]);
    setError("Book added to cart.");
    setTimeout(() => setError(null), 1200);
  };

  const startInlineEdit = (book) => {
    setEditingId(book.id);
    setEditDraft({
      title: book.title || "",
      desc: book.desc || "",
      price: String(book.price || ""),
      cover: book.cover || "",
    });
  };

  const saveInlineEdit = async (bookId) => {
    try {
      await axios.put(`${API_BASE_URL}/books/${bookId}`, editDraft);
      setBooks((prev) => prev.map((b) => (b.id === bookId ? { ...b, ...editDraft, price: Number(editDraft.price) } : b)));
      setEditingId(null);
    } catch (err) {
      console.error(err);
      setError("Quick edit failed.");
    }
  };

  const toggleSelect = (bookId) => {
    setSelected((prev) => ({ ...prev, [bookId]: !prev[bookId] }));
  };

  const selectedIds = Object.keys(selected).filter((id) => selected[id]);

  const handleBulkDelete = async () => {
    if (!selectedIds.length) return;
    try {
      await Promise.all(selectedIds.map((id) => axios.delete(`${API_BASE_URL}/books/${id}`)));
      setBooks((prev) => prev.filter((b) => !selected[String(b.id)]));
      setSelected({});
    } catch (err) {
      console.error(err);
      setError("Bulk delete failed.");
    }
  };

  const handleBulkPrice = async () => {
    const percent = Number(bulkPercent);
    if (!selectedIds.length || Number.isNaN(percent)) {
      setError("Select books and enter a valid percent.");
      return;
    }

    try {
      const selectedBooks = books.filter((b) => selected[String(b.id)]);
      await Promise.all(
        selectedBooks.map((book) => {
          const newPrice = Number(book.price) * (1 + percent / 100);
          return axios.put(`${API_BASE_URL}/books/${book.id}`, {
            title: book.title,
            desc: book.desc,
            cover: book.cover,
            price: Number(newPrice.toFixed(2)),
          });
        })
      );

      setBooks((prev) =>
        prev.map((book) => {
          if (!selected[String(book.id)]) return book;
          const updatedPrice = Number(book.price) * (1 + percent / 100);
          return { ...book, price: Number(updatedPrice.toFixed(2)) };
        })
      );
      setBulkPercent("");
    } catch (err) {
      console.error(err);
      setError("Bulk price update failed.");
    }
  };

  const submitReview = (bookId) => {
    if (!reviewForm.name.trim() || !reviewForm.text.trim()) return;
    const bookReviews = reviews[bookId] || [];
    const nextReviews = {
      ...reviews,
      [bookId]: [
        ...bookReviews,
        {
          name: reviewForm.name.trim(),
          stars: Number(reviewForm.stars),
          text: reviewForm.text.trim(),
          at: new Date().toISOString(),
        },
      ],
    };
    setReviews(nextReviews);

    const avg =
      nextReviews[bookId].reduce((sum, item) => sum + Number(item.stars || 0), 0) / nextReviews[bookId].length;
    setMeta((prev) => ({
      ...prev,
      [bookId]: {
        ...prev[bookId],
        rating: Number(avg.toFixed(1)),
      },
    }));

    setReviewForm({ name: "", stars: 5, text: "" });
  };

  const enrichedBooks = useMemo(
    () =>
      books.map((book) => ({
        ...book,
        meta: meta[book.id] || {
          category: "Technology",
          tags: ["General"],
          rating: 4,
          favorite: false,
          stock: 0,
        },
      })),
    [books, meta]
  );

  const categories = useMemo(() => {
    const set = new Set(enrichedBooks.map((book) => book.meta.category));
    return ["all", ...Array.from(set)];
  }, [enrichedBooks]);

  const normalizedQuery = query.trim().toLowerCase();
  const filteredBooks = useMemo(() => {
    return enrichedBooks
      .filter((book) => {
        if (favoritesOnly && !book.meta.favorite) return false;
        if (categoryFilter !== "all" && book.meta.category !== categoryFilter) return false;

        if (!normalizedQuery) return true;
        const title = String(book.title || "").toLowerCase();
        const desc = String(book.desc || "").toLowerCase();
        const tags = (book.meta.tags || []).join(" ").toLowerCase();
        return title.includes(normalizedQuery) || desc.includes(normalizedQuery) || tags.includes(normalizedQuery);
      })
      .sort((a, b) => {
        if (sortBy === "price-low") return Number(a.price) - Number(b.price);
        if (sortBy === "price-high") return Number(b.price) - Number(a.price);
        if (sortBy === "title") return String(a.title || "").localeCompare(String(b.title || ""));
        if (sortBy === "rating") return Number(b.meta.rating || 0) - Number(a.meta.rating || 0);
        return Number(b.id) - Number(a.id);
      });
  }, [enrichedBooks, favoritesOnly, categoryFilter, normalizedQuery, sortBy]);

  const pageSize = 9;
  const totalPages = Math.max(1, Math.ceil(filteredBooks.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);

  useEffect(() => {
    if (currentPage !== safePage) setCurrentPage(safePage);
  }, [currentPage, safePage]);

  const paginatedBooks = filteredBooks.slice((safePage - 1) * pageSize, safePage * pageSize);

  const topPicks = [...enrichedBooks]
    .sort((a, b) => Number(b.meta.rating || 0) - Number(a.meta.rating || 0))
    .slice(0, 3);
  const newArrivals = [...enrichedBooks].sort((a, b) => Number(b.id) - Number(a.id)).slice(0, 3);

  const validPricedBooks = filteredBooks.filter((book) => toValidPrice(book.price) !== null);
  const totalValue = validPricedBooks.reduce((sum, book) => sum + Number(toValidPrice(book.price) || 0), 0);
  const averagePrice = validPricedBooks.length ? totalValue / validPricedBooks.length : 0;
  const lowStockCount = filteredBooks.filter((book) => Number(book.meta.stock || 0) <= 5).length;

  const stockLabel = (count) => {
    if (count <= 0) return "Out of stock";
    if (count <= 5) return "Limited";
    return "In stock";
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
          <span className="pill">Cart: {cart.length}</span>
          <Link to="/add">
            <button className="btn primary">Add a title</button>
          </Link>
          <button className="btn secondary" onClick={fetchAllBooks} disabled={loading}>
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </div>

      <section className="contrib-banner">
        <span>Contribute to Yash Academic Bookstore on GitHub.</span>
        <a
          href="https://github.com/arumullayaswanth/Fullstack-nodejs-aws-eks-project.git"
          target="_blank"
          rel="noopener noreferrer"
        >
          Click here to access the repository and create a pull request
        </a>
      </section>

      <section className="hero">
        <div className="hero-card">
          <div className="eyebrow">Yash Academic</div>
          <h1>Modern bookstore dashboard for real buyers.</h1>
          <p className="lede">
            Search faster, sort smarter, manage stock, and spotlight top titles.
          </p>
          <div className="hero-actions">
            <Link to="/add">
              <button className="btn primary">Add a title</button>
            </Link>
            <button className="btn secondary" onClick={handleBulkDelete} disabled={!selectedIds.length}>
              Bulk delete ({selectedIds.length})
            </button>
          </div>
        </div>
        <div className="stat-card">
          <div className="eyebrow">Catalog Snapshot</div>
          <div className="stat-value">{filteredBooks.length}</div>
          <div className="stat-label">Visible titles</div>
          <div className="stats-mini">
            <div>Avg price: ${toCurrency(averagePrice)}</div>
            <div>Catalog value: ${toCurrency(totalValue)}</div>
            <div>Low stock: {lowStockCount}</div>
            <div className="stat-label">Stats use valid catalog prices</div>
          </div>
        </div>
      </section>

      <section className="spotlight-grid">
        <div className="spotlight-card">
          <div className="eyebrow">Top picks</div>
          {topPicks.map((book) => (
            <div key={`top-${book.id}`} className="spotlight-item">
              <span>{book.title}</span>
              <span className="spotlight-meta">{Number(book.meta.rating).toFixed(1)} / 5</span>
            </div>
          ))}
        </div>
        <div className="spotlight-card">
          <div className="eyebrow">New arrivals</div>
          {newArrivals.map((book) => (
            <div key={`new-${book.id}`} className="spotlight-item">
              <span>{book.title}</span>
              <span className="spotlight-meta">ID #{book.id}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="catalog-controls">
        <div className="catalog-main">
          <div className="control-box">
            <label htmlFor="search">Search books</label>
            <input
              id="search"
              type="text"
              placeholder="Search title, description, tag"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          <div className="control-box">
            <label htmlFor="sort">Sort by</label>
            <select
              id="sort"
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="latest">Latest</option>
              <option value="price-low">Price: low to high</option>
              <option value="price-high">Price: high to low</option>
              <option value="title">Title: A to Z</option>
              <option value="rating">Highest rating</option>
            </select>
          </div>

          <div className="control-box">
            <label htmlFor="category">Category</label>
            <select
              id="category"
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category === "all" ? "All categories" : category}
                </option>
              ))}
            </select>
          </div>

          <button className={`btn ghost ${favoritesOnly ? "active-toggle" : ""}`} onClick={() => setFavoritesOnly((v) => !v)}>
            {favoritesOnly ? "Showing favorites" : "Favorites only"}
          </button>
        </div>

        <div className="catalog-actions">
          <div className="bulk-panel">
            <input
              type="number"
              placeholder="Bulk % (e.g. 10 or -5)"
              value={bulkPercent}
              onChange={(e) => setBulkPercent(e.target.value)}
            />
            <button className="btn secondary" onClick={handleBulkPrice} disabled={!selectedIds.length}>
              Bulk price update
            </button>
          </div>

          <button
            className="btn ghost"
            onClick={() => {
              setQuery("");
              setSortBy("latest");
              setCategoryFilter("all");
              setFavoritesOnly(false);
              setCurrentPage(1);
            }}
          >
            Clear filters
          </button>
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
      ) : paginatedBooks.length ? (
        <>
          <div className="books-grid">
            {paginatedBooks.map((book) => (
              <article key={book.id} className="book-card">
                <div className="select-wrap">
                  <input type="checkbox" checked={!!selected[String(book.id)]} onChange={() => toggleSelect(String(book.id))} />
                  <span>Select</span>
                </div>

                <div className="cover-wrap">
                  <img src={book.cover || FALLBACK_COVER} alt={book.title} loading="lazy" onError={handleImageError} />
                  <span className="price-chip">${toCurrency(book.price)}</span>
                  <span className="featured-chip">{stockLabel(Number(book.meta.stock || 0))}</span>
                </div>

                {editingId === book.id ? (
                  <div className="inline-edit">
                    <input value={editDraft.title} onChange={(e) => setEditDraft((p) => ({ ...p, title: e.target.value }))} />
                    <textarea rows={3} value={editDraft.desc} onChange={(e) => setEditDraft((p) => ({ ...p, desc: e.target.value }))} />
                    <input
                      type="number"
                      value={editDraft.price}
                      onChange={(e) => setEditDraft((p) => ({ ...p, price: e.target.value }))}
                    />
                    <input value={editDraft.cover} onChange={(e) => setEditDraft((p) => ({ ...p, cover: e.target.value }))} />
                    <div className="card-actions">
                      <button className="btn primary" onClick={() => saveInlineEdit(book.id)}>Save</button>
                      <button className="btn ghost" onClick={() => setEditingId(null)}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="book-title">{book.title}</div>
                    <p className="book-desc">{book.desc}</p>
                    <div className="chip-row">
                      <span className="chip">{book.meta.category}</span>
                      {(book.meta.tags || []).slice(0, 2).map((tag) => (
                        <span key={`${book.id}-${tag}`} className="chip">{tag}</span>
                      ))}
                      <span className="chip">{Number(book.meta.rating).toFixed(1)} / 5</span>
                    </div>

                    <div className="card-actions wrap-actions">
                      <button className="btn ghost" onClick={() => setQuickView(book)}>Quick view</button>
                      <button className="btn ghost" onClick={() => handleShare(book)}>Share</button>
                      <button className="btn ghost" onClick={() => addToCart(book)}>Add to cart</button>
                    </div>

                    <div className="card-actions wrap-actions">
                      <button className={`btn ghost ${book.meta.favorite ? "favorite-on" : ""}`} onClick={() => toggleFavorite(book.id)}>
                        {book.meta.favorite ? "Favorited" : "Favorite"}
                      </button>
                      <button className="btn ghost" onClick={() => startInlineEdit(book)}>Quick edit</button>
                      <Link to={`/update/${book.id}`}>
                        <button className="btn ghost">Edit page</button>
                      </Link>
                      <button className="btn ghost danger" onClick={() => handleDelete(book.id)}>Delete</button>
                      <button className="btn primary">Buy now</button>
                    </div>
                  </>
                )}
              </article>
            ))}
          </div>

          <div className="pager">
            <button className="btn ghost" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={safePage === 1}>
              Previous
            </button>
            <span>Page {safePage} of {totalPages}</span>
            <button className="btn ghost" onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={safePage === totalPages}>
              Next
            </button>
          </div>
        </>
      ) : (
        <div className="empty">
          No books match your filters. Try clearing search/category/favorites.
        </div>
      )}

      {quickView && (
        <div className="modal-backdrop" onClick={() => setQuickView(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setQuickView(null)}>x</button>
            <div className="modal-grid">
              <img
                src={quickView.cover || FALLBACK_COVER}
                alt={quickView.title}
                className="modal-cover"
                onError={handleImageError}
              />
              <div>
                <div className="eyebrow">Quick View</div>
                <h2>{quickView.title}</h2>
                <p className="lede">{quickView.desc}</p>
                <div className="chip-row">
                  <span className="chip">Price: ${toCurrency(quickView.price)}</span>
                  <span className="chip">Rating: {Number((meta[quickView.id]?.rating || 0)).toFixed(1)} / 5</span>
                </div>
                <div className="card-actions wrap-actions" style={{ marginTop: 12 }}>
                  <button className="btn primary" onClick={() => addToCart(quickView)}>Add to cart</button>
                  <button className="btn ghost" onClick={() => handleShare(quickView)}>Share</button>
                  <button className="btn ghost" onClick={() => toggleFavorite(quickView.id)}>
                    {meta[quickView.id]?.favorite ? "Favorited" : "Favorite"}
                  </button>
                </div>
              </div>
            </div>

            <div className="review-block">
              <h3>Ratings and Reviews</h3>
              <div className="review-list">
                {(reviews[quickView.id] || []).map((r, idx) => (
                  <div key={`${quickView.id}-r-${idx}`} className="review-item">
                    <strong>{r.name}</strong> ({r.stars}/5)
                    <p>{r.text}</p>
                  </div>
                ))}
                {!(reviews[quickView.id] || []).length && <p className="stat-label">No reviews yet.</p>}
              </div>

              <div className="review-form">
                <input
                  placeholder="Your name"
                  value={reviewForm.name}
                  onChange={(e) => setReviewForm((p) => ({ ...p, name: e.target.value }))}
                />
                <select
                  value={reviewForm.stars}
                  onChange={(e) => setReviewForm((p) => ({ ...p, stars: Number(e.target.value) }))}
                >
                  {[5, 4, 3, 2, 1].map((n) => (
                    <option key={n} value={n}>{n} stars</option>
                  ))}
                </select>
                <textarea
                  rows={3}
                  placeholder="Write your review"
                  value={reviewForm.text}
                  onChange={(e) => setReviewForm((p) => ({ ...p, text: e.target.value }))}
                />
                <button className="btn secondary" onClick={() => submitReview(quickView.id)}>Submit review</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <SocialLinks />
    </div>
  );
};

export default Books;
