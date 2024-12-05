const axios = require('axios');
const querystring = require('querystring');

const clientId = process.env.SPOTIFY_CLIENT_ID;
const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

const getSpotifyAccessToken = async () => {
  const tokenUrl = 'https://accounts.spotify.com/api/token';
  const authHeader = 'Basic ' + Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  const params = new URLSearchParams();
  params.append('grant_type', 'client_credentials');

  try {
    const response = await axios.post(tokenUrl, params.toString(), {
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    const accessToken = response.data.access_token;
    console.log('Access Token:', accessToken);
    return accessToken;
  } catch (error) {
    console.error('Error fetching access token:', error);
    return null;
  }
};

module.exports = getSpotifyAccessToken;