import express from "express";
import mysql from "mysql2";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("common"));

// MySQL pool for MySQL 8 auth + reconnects
const pool = mysql.createPool({
  connectionLimit: 10,
  host: process.env.DB_HOST,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT) || 3306,
  database: process.env.DB_NAME || "test",
  waitForConnections: true,
  queueLimit: 0,
});

// Startup connectivity check
pool.getConnection((err, conn) => {
  if (err) {
    console.error("MySQL pool connection failed:", err.code || err.message);
  } else {
    console.log("MySQL connected to", conn.config.host, "db", conn.config.database);
    conn.release();
  }
});

app.get("/", (_req, res) => res.json("hello"));

app.get("/health/db", (_req, res) => {
  pool.query("SELECT 1", (err) => {
    if (err) return res.status(500).json({ status: "down", error: err.code || err.message });
    return res.json({ status: "up" });
  });
});

app.get("/books", (_req, res) => {
  pool.query("SELECT * FROM books", (err, rows) => {
    if (err) {
      console.error("SELECT failed:", err);
      return res.status(500).json({ error: err.code || err.message });
    }
    return res.json(rows);
  });
});

app.post("/books", (req, res) => {
  const q = "INSERT INTO books(`title`, `desc`, `price`, `cover`) VALUES (?)";
  const values = [req.body.title, req.body.desc, req.body.price, req.body.cover];

  pool.query(q, [values], (err, data) => {
    if (err) {
      console.error("INSERT failed:", err);
      return res.status(500).json({ error: err.code || err.message });
    }
    return res.json(data);
  });
});

app.delete("/books/:id", (req, res) => {
  const bookId = req.params.id;
  pool.query("DELETE FROM books WHERE id = ?", [bookId], (err, data) => {
    if (err) {
      console.error("DELETE failed:", err);
      return res.status(500).json({ error: err.code || err.message });
    }
    return res.json(data);
  });
});

app.put("/books/:id", (req, res) => {
  const bookId = req.params.id;
  const q = "UPDATE books SET `title`= ?, `desc`= ?, `price`= ?, `cover`= ? WHERE id = ?";
  const values = [req.body.title, req.body.desc, req.body.price, req.body.cover, bookId];

  pool.query(q, values, (err, data) => {
    if (err) {
      console.error("UPDATE failed:", err);
      return res.status(500).json({ error: err.code || err.message });
    }
    return res.json(data);
  });
});

app.listen(80, () => {
  console.log("Backend listening on port 80");
});
