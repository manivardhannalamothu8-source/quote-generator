import { useEffect, useState } from "react";
import "./App.css";

const API = "http://localhost:5000";

function App() {
  const [quote, setQuote] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const getQuote = async () => {
    setLoading(true);

    try {
      const response = await fetch(`${API}/api/quote`);
      const data = await response.json();
      setQuote(data);
    } catch (error) {
      console.error(error);
      alert("Could not fetch quote");
    }

    setLoading(false);
  };

  const getFavorites = async () => {
    try {
      const response = await fetch(`${API}/api/favorites`);
      const data = await response.json();
      setFavorites(data);
    } catch (error) {
      console.error(error);
    }
  };

  const addFavorite = async () => {
    if (!quote) return;

    try {
      await fetch(`${API}/api/favorites`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(quote),
      });

      getFavorites();
    } catch (error) {
      console.error(error);
    }
  };

  const deleteFavorite = async (id) => {
    try {
      await fetch(`${API}/api/favorites/${id}`, {
        method: "DELETE",
      });

      getFavorites();
    } catch (error) {
      console.error(error);
    }
  };

  const copyQuote = async () => {
    if (!quote) return;

    await navigator.clipboard.writeText(
      `"${quote.quote}" — ${quote.author}`
    );

    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 1500);
  };

  useEffect(() => {
    getQuote();
    getFavorites();
  }, []);

  return (
    <div className="app">
      <header>
        <h1>✨ Quote Generator</h1>
        <p>Discover inspiring quotes and save your favorites.</p>
      </header>

      <main>
        <section className="quote-card">
          {loading ? (
            <h2>Loading quote...</h2>
          ) : quote ? (
            <>
              <div className="quote-mark">“</div>

              <h2>{quote.quote}</h2>

              <p className="author">— {quote.author}</p>

              <div className="buttons">
                <button onClick={getQuote}>
                  🎲 New Quote
                </button>

                <button onClick={addFavorite}>
                  ❤️ Favorite
                </button>

                <button onClick={copyQuote}>
                  📋 {copied ? "Copied!" : "Copy"}
                </button>
              </div>
            </>
          ) : (
            <h2>No quote available</h2>
          )}
        </section>

        <section className="history">
          <h2>❤️ Favorites History</h2>

          {favorites.length === 0 ? (
            <p className="empty">
              No favorite quotes yet. Save one above!
            </p>
          ) : (
            favorites.map((item) => (
              <div className="favorite-card" key={item.id}>
                <p>“{item.quote}”</p>

                <strong>— {item.author}</strong>

                <button
                  className="delete"
                  onClick={() => deleteFavorite(item.id)}
                >
                  🗑️ Delete
                </button>
              </div>
            ))
          )}
        </section>
      </main>

      <footer>
        <p>Quote Generator • Built with React, Express & SQLite</p>
      </footer>
    </div>
  );
}

export default App;