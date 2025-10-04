import React, { useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";

const Login = () => {
  const { login } = useContext(AuthContext);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await axios.post("http://localhost:3001/api/auth/login", formData);
      login(res.data.user);
      setMessage("Login successful ✅");
    } catch (err) {
      console.error(err.response?.data || err.message);
      setMessage(err.response?.data?.error || "Login failed ❌");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🎵</div>
          <h1 className="text-4xl font-bold text-white mb-2">Mood Playlist</h1>
          <p className="text-blue-200">Create playlists based on your mood</p>
        </div>

        {/* Login Form */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">Welcome Back</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-blue-100 mb-2">Email</label>
              <input 
                type="email" 
                name="email" 
                placeholder="Enter your email" 
                value={formData.email} 
                onChange={handleChange} 
                className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200" 
                required 
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-blue-100 mb-2">Password</label>
              <input 
                type="password" 
                name="password" 
                placeholder="Enter your password" 
                value={formData.password} 
                onChange={handleChange} 
                className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200" 
                required 
              />
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-purple-500 to-blue-500 text-white py-3 px-6 rounded-xl font-semibold hover:from-purple-600 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-transparent transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Signing In...
                </div>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {message && (
            <div className={`mt-4 p-3 rounded-xl text-center font-medium ${
              message.includes('successful') 
                ? 'bg-green-500/20 text-green-200 border border-green-400/30' 
                : 'bg-red-500/20 text-red-200 border border-red-400/30'
            }`}>
              {message}
            </div>
          )}

          <div className="mt-6 text-center">
            <p className="text-blue-200">
              Don't have an account?{" "}
              <a href="/register" className="text-white font-semibold hover:text-blue-200 transition-colors">
                Sign up here
              </a>
            </p>
          </div>
        </div>

        {/* Features */}
        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          <div className="text-white/80">
            <div className="text-2xl mb-1">🎶</div>
            <p className="text-sm">Spotify Integration</p>
          </div>
          <div className="text-white/80">
            <div className="text-2xl mb-1">😊</div>
            <p className="text-sm">Mood Detection</p>
          </div>
          <div className="text-white/80">
            <div className="text-2xl mb-1">🎵</div>
            <p className="text-sm">Smart Playlists</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
