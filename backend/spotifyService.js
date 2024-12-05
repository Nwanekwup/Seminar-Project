const axios = require('axios');

const fetchSpotifyTrackId = async (title, artist) => {
  const accessToken = process.env.ACCESS_TOKEN; 
  if (!accessToken) {
    console.error('No access token available');
    return null;
  }

  try {
    const response = await axios.get('https://api.spotify.com/v1/search', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      params: {
        q: `track:${title} artist:${artist}`,
        type: 'track',
        limit: 1,
      },
    });

    const tracks = response.data.tracks.items;
    if (tracks.length > 0) {
      return tracks[0].id;
    } else {
      console.log(`No Spotify track found for ${title} by ${artist}`);
      return null;
    }
  } catch (error) {
    console.error('Error fetching Spotify track ID:', error);
    return null;
  }
};

module.exports = {
  fetchSpotifyTrackId,
};