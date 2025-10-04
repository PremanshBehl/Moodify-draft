const axios = require('axios');
const { prisma } = require('../config/db');

// Mapping mood to valence values (Spotify uses valence 0–1)
const moodValence = {
  sad: 0.2,
  happy: 0.9,
  chill: 0.5,
  energetic: 0.8,
  romantic: 0.6
};

// Mapping language to Spotify genre seeds
const languageGenres = {
  hindi: 'indian',
  punjabi: 'punjabi',
  english: 'pop'
};

exports.createMoodPlaylist = async (req, res) => {
  const { mood, language, accessToken, userId } = req.body;

  if (!mood || !language || !userId) {
    return res.status(400).json({ error: 'Missing required fields: mood, language, userId' });
  }

  try {
    // Check if user has Spotify access token
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // If user has Spotify token, create real playlist
    if (user.accessToken) {
      return await createSpotifyPlaylist(req, res, user.accessToken, mood, language, userId);
    } else {
      // If no Spotify token, create mock playlist
      return await createMockPlaylist(req, res, mood, language, userId);
    }
  } catch (err) {
    console.error('Error in createMoodPlaylist:', err);
    res.status(500).json({ error: 'Failed to create playlist' });
  }
};

// Create actual Spotify playlist
const createSpotifyPlaylist = async (req, res, accessToken, mood, language, userId) => {
  try {
    // 1️⃣ Get Recommendations
    const recommendations = await axios.get('https://api.spotify.com/v1/recommendations', {
      headers: { Authorization: `Bearer ${accessToken}` },
      params: {
        seed_genres: languageGenres[language.toLowerCase()] || 'pop',
        target_valence: moodValence[mood.toLowerCase()] || 0.5,
        limit: 20
      }
    });

    const trackUris = recommendations.data.tracks.map(track => track.uri);

    // 2️⃣ Get User Profile
    const userData = await axios.get('https://api.spotify.com/v1/me', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    const spotifyUserId = userData.data.id;

    // 3️⃣ Create Playlist
    const playlist = await axios.post(
      `https://api.spotify.com/v1/users/${spotifyUserId}/playlists`,
      {
        name: `${mood} ${language} Playlist`,
        description: `A playlist generated for your ${mood} mood in ${language}`,
        public: false
      },
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    const playlistId = playlist.data.id;

    // 4️⃣ Add Tracks to Playlist
    await axios.post(
      `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
      { uris: trackUris },
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    // 5️⃣ Save playlist to database
    const savedPlaylist = await prisma.playlist.create({
      data: {
        userId: userId,
        mood: mood,
        language: language,
        spotifyPlaylistId: playlistId,
        name: `${mood} ${language} Playlist`
      }
    });

    res.json({ 
      success: true,
      message: 'Playlist created successfully!',
      playlistUrl: playlist.data.external_urls.spotify,
      playlist: savedPlaylist
    });
  } catch (err) {
    console.error('Error creating Spotify playlist:', err.response?.data || err.message);
    res.status(500).json({ error: 'Failed to create Spotify playlist' });
  }
};

// Create mock playlist for users without Spotify
const createMockPlaylist = async (req, res, mood, language, userId) => {
  try {
    // Create mock playlist in database
    const mockPlaylist = await prisma.playlist.create({
      data: {
        userId: userId,
        mood: mood,
        language: language,
        spotifyPlaylistId: null,
        name: `${mood} ${language} Playlist (Mock)`
      }
    });

    res.json({ 
      success: true,
      message: 'Mock playlist created! Connect to Spotify to create real playlists.',
      playlistUrl: null,
      playlist: mockPlaylist,
      needsSpotify: true
    });
  } catch (err) {
    console.error('Error creating mock playlist:', err);
    res.status(500).json({ error: 'Failed to create mock playlist' });
  }
};

exports.getUserPlaylists = async (req, res) => {
  const { userId } = req.params;

  try {
    const playlists = await prisma.playlist.findMany({
      where: { userId: userId },
      orderBy: { createdAt: 'desc' }
    });

    return res.json({
      success: true,
      playlists: playlists
    });
  } catch (error) {
    console.error('Error fetching playlists:', error.message);
    return res.status(500).json({ error: 'Failed to fetch playlists' });
  }
};