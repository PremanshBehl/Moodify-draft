# Backend Migration from Mongoose to Prisma

## Overview
The backend has been successfully migrated from Mongoose (MongoDB ODM) to Prisma (Database ORM).

## Changes Made

### 1. Dependencies Updated
- **Removed**: `mongoose`, `mongodb`
- **Added**: `prisma`, `@prisma/client`

### 2. Database Configuration
- **File**: `config/db.js`
- **Changes**: Replaced Mongoose connection with Prisma client
- **Export**: Now exports both `connectDB` function and `prisma` client instance

### 3. Models Migration
- **Removed**: All Mongoose model files (`models/User.js`, `models/Playlist.js`, `models/Favorite.js`, `models/History.js`)
- **Added**: Prisma schema file (`prisma/schema.prisma`) with equivalent models:
  - `User` model with Spotify integration fields
  - `Playlist` model for storing user playlists
  - `Favorite` model for user favorites
  - `History` model for user activity tracking

### 4. Controllers Updated
- **authController.js**: Updated to use Prisma for user creation and updates
- **playlistController.js**: Enhanced with database operations to save playlists and retrieve user playlists

### 5. Routes Enhanced
- **playlist.js**: Added new route `GET /api/playlist/user/:userId` to fetch user playlists

## Database Schema

### User Model
```prisma
model User {
  id          String   @id @default(auto()) @map("_id") @db.ObjectId
  spotifyId   String   @unique
  displayName String?
  email       String?
  accessToken String?
  refreshToken String?
  mood        String?
  language    String?
  playlists   Playlist[]
  favorites   Favorite[]
  history     History[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

### Playlist Model
```prisma
model Playlist {
  id               String   @id @default(auto()) @map("_id") @db.ObjectId
  userId           String   @db.ObjectId
  mood             String?
  language         String?
  spotifyPlaylistId String?
  name             String?
  createdAt        DateTime @default(now())
  user             User     @relation(fields: [userId], references: [id])
}
```

## API Endpoints

### Authentication
- `GET /auth/login` - Redirect to Spotify authentication
- `GET /auth/callback` - Handle Spotify callback and create/update user

### Playlists
- `POST /api/playlist/mood` - Create mood-based playlist
- `GET /api/playlist/user/:userId` - Get user's playlists

## Setup Instructions

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Generate Prisma client**:
   ```bash
   npx prisma generate
   ```

3. **Start the server**:
   ```bash
   node server.js
   ```

## Benefits of Migration

1. **Type Safety**: Prisma provides better type safety with TypeScript support
2. **Better Developer Experience**: Auto-completion and better error messages
3. **Database Agnostic**: Easy to switch between different databases
4. **Modern ORM**: More modern and actively maintained compared to Mongoose
5. **Better Performance**: Optimized queries and connection pooling

## Notes

- The migration maintains backward compatibility with existing API endpoints
- All existing functionality has been preserved
- The database structure remains the same (MongoDB)
- Axios is still used for Spotify API calls (as requested)
