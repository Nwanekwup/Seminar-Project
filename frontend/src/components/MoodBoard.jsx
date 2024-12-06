// MoodBoard.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './MoodBoard.css';

const backendAddress = import.meta.env.VITE_BACKEND_ADDRESS;

const MoodBoard = () => {
  const navigate = useNavigate();
  const { userId } = useParams();
  const [mood, setMood] = useState('');
  const [songs, setSongs] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMoodAndSongs = async () => {
      try {
        const response = await fetch(
          `${backendAddress}/recommendations?userId=${userId}`
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (!data.songs) {
          throw new Error('No songs found');
        }
        setMood(data.mood);
        setSongs(data.songs);
      } catch (error) {
        console.error('Error fetching mood and songs:', error);
        setError(error.message);
      }
    };

    fetchMoodAndSongs();
  }, [userId]);

  if (error) {
    return <div className="moodboard-container">Error: {error}</div>;
  }

  const handleBackToHome = () => {
    navigate(`/home/${userId}`);
  };

  return (
    <div className="moodboard-container">
      <h2>MoodBoard: Feeling {mood}?</h2>
      <h3>These rhythms should match your vibe!</h3>
      <ul>
        {songs.map((song) => (
          <li key={song.id}>
            <a
              href={`https://open.spotify.com/track/${song.spotifyId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="song-link"
            >
              <div className="song-info">
                <div className="song-title">{song.title}</div>
                <div className="song-artist">by {song.artist}</div>
              </div>
            </a>
          </li>
        ))}
      </ul>
      <button className="back-to-home" onClick={handleBackToHome}>
        Home
      </button>
    </div>
  );
};

export default MoodBoard;