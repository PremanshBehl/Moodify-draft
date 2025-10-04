const express = require('express');
const router = express.Router();
const { createMoodPlaylist, getUserPlaylists } = require('../controllers/playlistController');

// POST /api/playlist/mood
router.post('/mood', createMoodPlaylist);

// GET /api/playlist/user/:userId
router.get('/user/:userId', getUserPlaylists);

module.exports = router;
