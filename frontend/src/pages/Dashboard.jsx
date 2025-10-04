import React, { useState, useEffect } from "react";
import API from "../services/api";
import PlaylistCard from "../components/PlaylistCard";

const Dashboard = () => {
  const [mood, setMood] = useState("happy");
  const [language, setLanguage] = useState("english");
  const [playlistUrl, setPlaylistUrl] = useState(null);
  const [userPlaylists, setUserPlaylists] = useState([]);
  const [isCreating, setIsCreating] = useState(false);

  const user = JSON.parse(localStorage.getItem("user"));

  const createPlaylist = async () => {
    setIsCreating(true);
    try {
      const res = await API.post("/playlist/mood", {
        mood,
        language,
        accessToken: user.accessToken,
        userId: user.id,
      });
      
      if (res.data.success) {
        setPlaylistUrl(res.data.playlistUrl);
        fetchPlaylists();
        
        // Show success message
        if (res.data.needsSpotify) {
          alert("Mock playlist created! To create real Spotify playlists, you need to connect your Spotify account. Go to Settings to connect Spotify.");
        } else {
          alert("Playlist created successfully! Check your Spotify app.");
        }
      }
    } catch (err) {
      console.error(err.response?.data || err.message);
      alert("Failed to create playlist. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  const fetchPlaylists = async () => {
    try {
      const res = await API.get(`/playlist/user/${user.id}`);
      setUserPlaylists(res.data.playlists);
    } catch (err) {
      console.error(err.response?.data || err.message);
    }
  };

  useEffect(() => {
    if (user) fetchPlaylists();
  }, []);

  const moodOptions = [
    { value: "happy", label: "Happy", emoji: "😊", color: "from-yellow-400 to-orange-500" },
    { value: "sad", label: "Sad", emoji: "😢", color: "from-blue-400 to-indigo-500" },
    { value: "chill", label: "Chill", emoji: "😌", color: "from-green-400 to-teal-500" },
    { value: "energetic", label: "Energetic", emoji: "⚡", color: "from-red-400 to-pink-500" },
    { value: "romantic", label: "Romantic", emoji: "💕", color: "from-pink-400 to-rose-500" },
  ];

  const languageOptions = [
    { value: "english", label: "English", flag: "🇺🇸" },
    { value: "hindi", label: "Hindi", flag: "🇮🇳" },
    { value: "punjabi", label: "Punjabi", flag: "🇮🇳" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome back, {user?.displayName || user?.email}! 👋
          </h1>
          <p className="text-xl text-gray-600">Create the perfect playlist for your mood</p>
          
          {/* Spotify Connection Status */}
          {!user?.accessToken && (
            <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-xl p-4 max-w-md mx-auto">
              <div className="flex items-center justify-center mb-2">
                <span className="text-2xl mr-2">🎵</span>
                <span className="font-semibold text-yellow-800">Connect Spotify</span>
              </div>
              <p className="text-yellow-700 text-sm mb-3">
                Connect your Spotify account to create real playlists with music!
              </p>
              <a 
                href="http://localhost:3001/api/auth/spotify-login"
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition-colors inline-block"
              >
                Connect Spotify
              </a>
            </div>
          )}
        </div>

        {/* Playlist Creation Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Create New Playlist</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Mood Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Choose Your Mood</label>
              <div className="grid grid-cols-2 gap-3">
                {moodOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setMood(option.value)}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                      mood === option.value
                        ? `border-purple-500 bg-gradient-to-r ${option.color} text-white shadow-lg transform scale-105`
                        : 'border-gray-200 bg-white hover:border-purple-300 hover:shadow-md'
                    }`}
                  >
                    <div className="text-2xl mb-1">{option.emoji}</div>
                    <div className="font-medium">{option.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Language Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Select Language</label>
              <div className="space-y-3">
                {languageOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setLanguage(option.value)}
                    className={`w-full p-4 rounded-xl border-2 transition-all duration-200 ${
                      language === option.value
                        ? 'border-blue-500 bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                        : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-center justify-center space-x-3">
                      <span className="text-xl">{option.flag}</span>
                      <span className="font-medium">{option.label}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Create Button */}
          <div className="text-center">
            <button
              onClick={createPlaylist}
              disabled={isCreating}
              className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
            >
              {isCreating ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                  Creating Playlist...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <span className="mr-2">🎵</span>
                  Create Playlist
                </div>
              )}
            </button>
          </div>
        </div>

        {/* Success Message */}
        {playlistUrl && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-8">
            <div className="flex items-center">
              <div className="text-2xl mr-3">✅</div>
              <div>
                <h3 className="text-lg font-semibold text-green-800">Playlist Created Successfully!</h3>
                <p className="text-green-600">
                  <a 
                    href={playlistUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="underline hover:text-green-800 transition-colors"
                  >
                    Open in Spotify →
                  </a>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* User Playlists Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Playlists</h2>
          
          {userPlaylists.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🎵</div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No playlists yet</h3>
              <p className="text-gray-500">Create your first mood-based playlist above!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userPlaylists.map((playlist) => (
                <PlaylistCard key={playlist.id} playlist={playlist} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;