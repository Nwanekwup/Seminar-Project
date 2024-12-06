import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./Search.css";

const backendAddress = import.meta.env.VITE_BACKEND_ADDRESS;

const Search = () => {
  const navigate = useNavigate();
  const { userId } = useParams();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [moods, setMoods] = useState([]);
  const [artists, setArtists] = useState([]);
  const [selectedMoods, setSelectedMoods] = useState([]);
  const [excludedMoods, setExcludedMoods] = useState([]);
  const [selectedArtists, setSelectedArtists] = useState([]);
  const [showArtistDropdown, setShowArtistDropdown] = useState(false);
  const [showExcludeMoodDropdown, setShowExcludeMoodDropdown] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const moodResponse = await fetch(`${backendAddress}/moods`);
        const artistResponse = await fetch(`${backendAddress}/artists`);
        const moodData = await moodResponse.json();
        const artistData = await artistResponse.json();
        setMoods(moodData);
        setArtists(artistData);
        console.log("successful", moodData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (
      query === "" &&
      selectedMoods.length === 0 &&
      selectedArtists.length === 0 &&
      excludedMoods.length === 0
    ) {
      setResults([]);
    }
  }, [query, selectedMoods, selectedArtists, excludedMoods]);

  const handleSearch = async () => {
    try {
      const response = await fetch(
        `${backendAddress}/search?query=${query}&moods=${selectedMoods.join(
          ","
        )}&artists=${selectedArtists.join(
          ","
        )}&excludeMoods=${excludedMoods.join(",")}`
      );
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error("Error fetching search results:", error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const toggleSelection = (item, setSelectedItems, selectedItems) => {
    setSelectedItems((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const handleBackToHome = () => {
    navigate(`/home/${userId}`);
  };

  return (
    <div className="search-container">
      <header>
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search for songs by title, artist, lyrics, or mood"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <button onClick={handleSearch}>Search</button>
        </div>
        <div className="mood-filters">
          <label>Filter by Mood:</label>
          {moods.map((mood) => (
            <button
              key={mood}
              className={`mood-button ${
                selectedMoods.includes(mood) ? "selected" : ""
              }`}
              onClick={() =>
                toggleSelection(mood, setSelectedMoods, selectedMoods)
              }
            >
              {mood}
            </button>
          ))}
        </div>
        <div className="filters">
          <div className="filter-group">
            <button
              className="dropdown-button"
              onClick={() => setShowArtistDropdown(!showArtistDropdown)}
            >
              Select Artists
            </button>
            {showArtistDropdown && (
              <div className="dropdown-menu">
                {artists.map((artist) => (
                  <div
                    key={artist}
                    className={selectedArtists.includes(artist) ? "selected" : ""}
                    onClick={() =>
                      toggleSelection(
                        artist,
                        setSelectedArtists,
                        selectedArtists
                      )
                    }
                  >
                    {artist}
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="filter-group">
            <button
              className="dropdown-button"
              onClick={() =>
                setShowExcludeMoodDropdown(!showExcludeMoodDropdown)
              }
            >
              Exclude Moods
            </button>
            {showExcludeMoodDropdown && (
              <div className="dropdown-menu">
                {moods.map((mood) => (
                  <div
                    key={mood}
                    className={excludedMoods.includes(mood) ? "selected" : ""}
                    onClick={() =>
                      toggleSelection(mood, setExcludedMoods, excludedMoods)
                    }
                  >
                    {mood}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>
      <div className="results">
        {results.map((song) => (
          <div key={song.id} className="song">
            <h3>{song.title}</h3>
            <p>{song.artist}</p>
          </div>
        ))}
      </div>
      <button className="back-to-home" onClick={handleBackToHome}>
        Home
      </button>
    </div>
  );
};

export default Search;