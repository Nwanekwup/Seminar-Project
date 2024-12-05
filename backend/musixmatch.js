const axios = require('axios');
require('dotenv').config();

const musixmatchApiKey = process.env.MUSIXMATCH_API_KEY;

const getLyrics = async (trackName, artistName) => {
  const url = `https://api.musixmatch.com/ws/1.1/matcher.lyrics.get?q_track=${encodeURIComponent(trackName)}&q_artist=${encodeURIComponent(artistName)}&apikey=${musixmatchApiKey}`;
  
  try {
    const response = await axios.get(url);
    // console.log(response.data.message.body);
    const lyrics = response.data.message.body.lyrics.lyrics_body;
    // console.log(lyrics);
    return lyrics;
  } catch (error) {
    console.error('Error fetching lyrics:', error);
    return null;
  }
};

module.exports = getLyrics;