const axios = require('axios');
const qs = require('qs');
const { clientId, clientSecret, redirectUri } = require('../config/spotifyConfig');
const { prisma } = require('../config/db');

// STEP 1: Email/Password Login
const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Missing required fields: email, password' });
  }

  try {
    // Find user by email
    const user = await prisma.user.findFirst({
      where: { email: email }
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // For now, we'll accept any password since we don't have password hashing set up
    // In production, you should hash passwords and compare them
    res.json({ 
      message: 'Login successful', 
      user: {
        id: user.id,
        displayName: user.displayName,
        email: user.email,
        accessToken: user.accessToken
      }
    });
  } catch (err) {
    console.error('Error in login:', err);
    res.status(500).json({ error: 'Login failed' });
  }
};

// STEP 1b: Spotify OAuth Login (redirect to Spotify auth page)
const spotifyLogin = (req, res) => {
  const scope = 'user-read-email playlist-modify-public playlist-modify-private';
  const spotifyAuthUrl = `https://accounts.spotify.com/authorize?response_type=code&client_id=${clientId}&scope=${encodeURIComponent(scope)}&redirect_uri=${encodeURIComponent(redirectUri)}`;
  
  res.redirect(spotifyAuthUrl);
};

// STEP 2: Callback (exchange code for tokens + save user in DB)
const callback = async (req, res) => {
  const code = req.query.code;

  try {
    // Exchange code for access token
    const tokenResponse = await axios.post(
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

    const { access_token, refresh_token } = tokenResponse.data;

    // Fetch user profile from Spotify
    const profileResponse = await axios.get('https://api.spotify.com/v1/me', {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    const spotifyUser = profileResponse.data;

    // Save or update user in DB
    let user = await prisma.user.findUnique({ 
      where: { spotifyId: spotifyUser.id } 
    });
    
    if (!user) {
      user = await prisma.user.create({
        data: {
          spotifyId: spotifyUser.id,
          displayName: spotifyUser.display_name,
          email: spotifyUser.email,
          accessToken: access_token,
          refreshToken: refresh_token,
        }
      });
    } else {
      user = await prisma.user.update({
        where: { spotifyId: spotifyUser.id },
        data: {
          accessToken: access_token,
          refreshToken: refresh_token,
        }
      });
    }

    res.json({ message: 'Login successful', user });
  } catch (err) {
    console.error('Error in Spotify callback:', err.response?.data || err.message);
    res.status(500).json({ error: 'Login failed' });
  }
};

// STEP 3: Register (create new user account)
const register = async (req, res) => {
  const { displayName, email, password } = req.body;

  if (!displayName || !email || !password) {
    return res.status(400).json({ error: 'Missing required fields: displayName, email, password' });
  }

  try {
    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email },
          { displayName: displayName }
        ]
      }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'User with this email or name already exists' });
    }

    // Create new user
    const user = await prisma.user.create({
      data: {
        displayName,
        email,
        spotifyId: `local_${Date.now()}`, // Temporary ID for local users
        accessToken: null, // Will be set when they connect Spotify
        refreshToken: null,
      }
    });

    res.json({ 
      message: 'Registration successful', 
      user: {
        id: user.id,
        displayName: user.displayName,
        email: user.email
      }
    });
  } catch (err) {
    console.error('Error in registration:', err);
    res.status(500).json({ error: 'Registration failed' });
  }
};

module.exports = { login, spotifyLogin, callback, register };
