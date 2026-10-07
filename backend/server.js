const express = require("express");
const cors = require("cors");
const Database = require("better-sqlite3");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Database
const db = new Database("quotes.db");

db.prepare(`
  CREATE TABLE IF NOT EXISTS favorites (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    quote TEXT NOT NULL,
    author TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`).run();

// Home route
app.get("/", (req, res) => {
  res.send("Quote Generator Backend is running successfully!");
});

// Get a random quote from the public API
app.get("/api/quote", async (req, res) => {
  try {
    const response = await fetch("https://dummyjson.com/quotes/random");

    if (!response.ok) {
      throw new Error("Quote API failed");
    }

    const data = await response.json();

    res.json({
      quote: data.quote,
      author: data.author
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Unable to fetch quote"
    });
  }
});

// Get all favorite quotes
app.get("/api/favorites", (req, res) => {
  const favorites = db
    .prepare("SELECT * FROM favorites ORDER BY created_at DESC")
    .all();

  res.json(favorites);
});

// Add a favorite quote
app.post("/api/favorites", (req, res) => {
  const { quote, author } = req.body;

  if (!quote || !author) {
    return res.status(400).json({
      error: "Quote and author are required"
    });
  }

  const result = db
    .prepare(
      "INSERT INTO favorites (quote, author) VALUES (?, ?)"
    )
    .run(quote, author);

  res.status(201).json({
    id: result.lastInsertRowid,
    quote,
    author
  });
});

// Delete a favorite
app.delete("/api/favorites/:id", (req, res) => {
  const { id } = req.params;

  db.prepare("DELETE FROM favorites WHERE id = ?").run(id);

  res.json({
    message: "Favorite deleted"
  });
});

// Start server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Backend server running on port ${PORT}`);
});