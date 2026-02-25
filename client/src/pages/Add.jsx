import axios from "axios";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API_BASE_URL from "./config";

const Add = () => {
  const [book, setBook] = useState({ title: "", desc: "", price: "", cover: "" });
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setBook((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleClick = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE_URL}/books`, book);
      navigate("/");
    } catch (err) {
      console.error(err);
      setError("Could not save. Please try again.");
    }
  };

  return (
    <div className="shell">
      <div className="form-shell">
        <div className="eyebrow">Yash Academic</div>
        <h1>Add a new title</h1>
        <p>Describe the book, set a price, and drop in a cover URL.</p>
        <form className="form-grid" onSubmit={handleClick}>
          <div className="field">
            <label htmlFor="title">Title</label>
            <input id="title" name="title" required placeholder="E.g., Deep Work" onChange={handleChange} />
          </div>
          <div className="field">
            <label htmlFor="desc">Description</label>
            <textarea id="desc" name="desc" required placeholder="What should readers know?" onChange={handleChange} />
          </div>
          <div className="field">
            <label htmlFor="price">Price (USD)</label>
            <input id="price" name="price" type="number" min="0" step="0.01" required placeholder="19.99" onChange={handleChange} />
          </div>
          <div className="field">
            <label htmlFor="cover">Cover URL</label>
            <input id="cover" name="cover" type="url" required placeholder="https://..." onChange={handleChange} />
          </div>
          <div className="form-actions">
            <Link to="/">
              <button type="button" className="btn secondary">Cancel</button>
            </Link>
            <button type="submit" className="btn primary">Save book</button>
          </div>
          {error && <div className="empty" style={{ borderStyle: "solid", margin: 0 }}>{error}</div>}
        </form>
      </div>
    </div>
  );
};

export default Add;
