// backend/middleware/spotifyAuth.js
const axios = require('axios');
const qs = require('qs');
const { clientId, clientSecret } = require('../config/spotifyConfig');

// Step 1: Get Spotify Access Token (OAuth)
const getSpotifyAccessToken = async (code, redirectUri) => {
  try {
    const response = await axios.post(
      'https://accounts.spotify.com/api/token',
      qs.stringify({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': 'Basic ' + Buffer.from(`${clientId}:${clientSecret}`).toString('base64'),
        },
      }
    );
    return response.data.access_token;
  } catch (err) {
    console.error('Error getting access token:', err.response?.data || err.message);
    return null;
  }
};

module.exports = { getSpotifyAccessToken };
