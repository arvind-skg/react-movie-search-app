import { useState, useEffect } from "react";
import "./App.css";

function App() {
  const API_KEY = "73ca3da"; 
  const [query, setQuery] = useState("");
  const [movies, setMovies] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [loading, setLoading] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [error, setError] = useState("");

// Load popular movies on page load
useEffect(() => {
  fetchPopularMovies();
}, []);

const fetchPopularMovies = async () => {
  setLoading(true);
  const popularSearchTerms = ["Avengers", "Inception", "Interstellar", "Dark Knight", "Titanic"];
  
  try {
    const promises = popularSearchTerms.map((term) =>
      fetch(`https://www.omdbapi.com/?s=${term}&apikey=${API_KEY}`).then((res) => res.json())
    );

    const results = await Promise.all(promises);
    const allMovies = results.flatMap((result) => result.Search || []);
    
    // Remove duplicates based on imdbID
    const uniqueMovies = Array.from(
      new Map(allMovies.map((movie) => [movie.imdbID, movie])).values()
    );

    setMovies(uniqueMovies.slice(0, 12)); // Show first 12 movies
  } catch (err) {
    setError("Failed to load movies.");
  }

  setLoading(false);
};

const searchMovies = async () => {
  if (!query.trim()) {
    setError("Please enter a movie name.");
    fetchPopularMovies(); // Reset to popular movies
    setSelectedMovie(null);
    return;
  }

  setLoading(true);
  setError("");
  setSelectedMovie(null);

  try {
    const response = await fetch(
      `https://www.omdbapi.com/?s=${query}&apikey=${API_KEY}`
    );
    const data = await response.json();

    if (data.Response === "False") {
      setError(data.Error);
      setMovies([]);
    } else {
      setMovies(data.Search);
    }
  } catch (err) {
    setError("Something went wrong. Please try again.");
    setMovies([]);
  }

  setLoading(false);
};

const getMovieDetails = async (imdbID) => {
  setDetailsLoading(true);
  setSelectedMovie(null);

  try {
    const response = await fetch(
      `https://www.omdbapi.com/?i=${imdbID}&apikey=${API_KEY}`
    );
    const data = await response.json();
    setSelectedMovie(data);
  } catch (err) {
    setError("Failed to load movie details.");
  }

  setDetailsLoading(false);
};

const handleKeyDown = (e) => {
  if (e.key === "Enter") {
    searchMovies();
  }
};

return (
  <div className="container">
    <h1>🎬 Movie Search App</h1>

    <div className="search-box">
      <input
        type="text"
        placeholder="Search for a movie..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <button onClick={searchMovies}>Search</button>
    </div>

    {loading && <p className="message">Loading...</p>}
    {error && <p className="message error">{error}</p>}

    {!loading && !error && movies.length === 0 && (
      <p className="message">No movies found. Try searching!</p>
    )}

    <div className="results">
      {movies.map((movie) => (
        <div
          className="movie-card"
          key={movie.imdbID}
          onClick={() => getMovieDetails(movie.imdbID)}
        >
          <img
            src={
              movie.Poster !== "N/A"
                ? movie.Poster
                : "https://via.placeholder.com/300x450?text=No+Image"
            }
            alt={movie.Title}
          />
          <div className="movie-info">
            <h3>{movie.Title}</h3>
            <p>{movie.Year}</p>
          </div>
        </div>
      ))}
    </div>

    {detailsLoading && <p className="message">Loading movie details...</p>}

    {selectedMovie && (
      <div className="movie-details">
        <h2>
          {selectedMovie.Title} ({selectedMovie.Year})
        </h2>
        <img
          src={
            selectedMovie.Poster !== "N/A"
              ? selectedMovie.Poster
              : "https://via.placeholder.com/300x450?text=No+Image"
          }
          alt={selectedMovie.Title}
        />
        <p>
          <strong>Genre:</strong> {selectedMovie.Genre}
        </p>
        <p>
          <strong>Director:</strong> {selectedMovie.Director}
        </p>
        <p>
          <strong>Actors:</strong> {selectedMovie.Actors}
        </p>
        <p>
          <strong>Plot:</strong> {selectedMovie.Plot}
        </p>
        <p>
          <strong>IMDb Rating:</strong> {selectedMovie.imdbRating}
        </p>
        <p>
          <strong>Language:</strong> {selectedMovie.Language}
        </p>
      </div>
    )}
  </div>
);
}

export default App;