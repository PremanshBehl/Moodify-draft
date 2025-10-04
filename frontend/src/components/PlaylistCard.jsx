import React from "react";

const PlaylistCard = ({ playlist }) => {
  return (
    <div className="border p-4 rounded shadow hover:shadow-lg">
      <h3 className="font-bold text-lg">{playlist.name}</h3>
      <p>Mood: {playlist.mood}</p>
      <p>Language: {playlist.language}</p>
      {playlist.spotifyPlaylistId && (
        <a
          href={`https://open.spotify.com/playlist/${playlist.spotifyPlaylistId}`}
          target="_blank"
          className="text-blue-600 underline"
        >
          Open in Spotify
        </a>
      )}
    </div>
  );
};

export default PlaylistCard;
