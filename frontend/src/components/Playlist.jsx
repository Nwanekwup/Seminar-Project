import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./Playlist.css";

const backendAddress = import.meta.env.VITE_BACKEND_ADDRESS;

const Playlist = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [playlist, setPlaylist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlaylist = async () => {
      try {
        const response = await fetch(`${backendAddress}/user/${userId}/playlist`);
        const data = await response.json();
        setPlaylist(data);
      } catch (error) {
        console.error("Error fetching playlist:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlaylist();
  }, [userId]);

  const handleBackToHome = () => {
    navigate(`/home/${userId}`);
  };

  return (
    <div className="playlist-container">
      <h2>Your Playlist</h2>
      {loading ? (
        <p>Loading...</p>
      ) : playlist.length > 0 ? (
        <ul className="song-list">
          {playlist.map((song) => (
            <li key={song.id} className="song-item">
              <div className="song-details">
                <h3>{song.title}</h3>
                <p className="artist-name">by {song.artist}</p>
                {song.spotifyUrl && (
                  <a
                    href={song.spotifyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="spotify-link"
                  >
                    Listen on Spotify
                  </a>
                )}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p>You have no songs yet, take the quiz to add more songs.</p>
      )}
      <button className="back-to-home" onClick={handleBackToHome}>
        Home
      </button>
    </div>
  );
};

export default Playlist;