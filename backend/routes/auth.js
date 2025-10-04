const express = require('express');
const router = express.Router();
const { login, spotifyLogin, callback, register } = require('../controllers/authController');

// Email/Password Login
router.post('/login', login);

// Spotify OAuth Login (redirect to Spotify)
router.get('/spotify-login', spotifyLogin);

// Spotify OAuth Callback
router.get('/callback', callback);

// User Registration
router.post('/register', register);

module.exports = router;
