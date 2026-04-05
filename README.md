# Music Streaming Backend

## Requirements

- Node.js 20+
- MongoDB
- Redis
- Cloudinary account

## Setup

1. Copy `.env.example` to `.env`
2. Fill in all required environment variables
3. Install dependencies:
   - `npm install`
4. Start the development server:
   - `npm run dev`

## Environment Variables

- `NODE_ENV`
- `PORT`
- `MONGODB_URI`
- `REDIS_URL`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `CLOUDINARY_AUDIO_FOLDER`
- `CLOUDINARY_IMAGE_FOLDER`
- `BCRYPT_SALT_ROUNDS`
- `UPLOAD_MAX_FILE_SIZE_MB`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`

If `ADMIN_EMAIL` and `ADMIN_PASSWORD` are provided together, an admin account is created or updated on startup.

## Scripts

- `npm run dev`
- `npm run build`
- `npm run typecheck`
- `npm start`

## Architecture

- `src/modules/auth` for registration and login
- `src/modules/users` for the user model and authenticated profile access
- `src/modules/songs` for public music access and admin song management logic
- `src/modules/admin` for admin-only route composition
- `src/modules/platform` for the single platform settings document and music state control
- `src/common` for guards, middleware, errors, constants, and shared utilities
- `src/config` for environment, logging, and Cloudinary setup
- `src/database` for MongoDB and Redis connection lifecycle

## Endpoints

### Auth

- `POST /auth/register`
- `POST /auth/login`

### User

- `GET /users/me`
- `GET /songs`
- `GET /songs/:id`
- `GET /songs/:id/stream`

### Admin

- `POST /admin/songs`
- `PATCH /admin/songs/:id`
- `DELETE /admin/songs/:id`
- `PATCH /admin/platform/enable`
- `PATCH /admin/platform/disable`

## Authentication

Use `Authorization: Bearer <token>` for protected routes.

Roles:

- `user`
- `admin`

Admin routes require both a valid JWT and the `admin` role.

## Global Music State Enforcement

The platform uses a single `PlatformSettings` document with `_id = "platform_settings"`.

Music availability is enforced in two layers:

1. `checkMusicEnabled` middleware is applied to the public songs router, so all user-facing song endpoints are blocked when the platform is disabled.
2. `SongsService` also checks the platform state before returning song lists, details, or streams, preventing accidental bypass if handlers are reused elsewhere.

State flow:

1. The value is stored in MongoDB
2. The current state is cached in Redis under `music_enabled`
3. On startup, the backend ensures the settings document exists and warms the Redis cache from MongoDB
4. When an admin enables or disables music, MongoDB is updated first and Redis is updated immediately after
5. If Redis is unavailable, the service falls back to MongoDB and repopulates cache when possible

When disabled, these endpoints return `403`:

- `GET /songs`
- `GET /songs/:id`
- `GET /songs/:id/stream`

## Upload Pipeline

Song uploads are handled only through admin routes.

Flow:

1. Admin sends multipart form-data with:
   - `audio`
   - `coverImage`
   - `title`
   - `artist`
   - `duration`
2. Multer stores files in memory only
3. The backend uploads the audio and image buffers directly to Cloudinary
4. Only the returned secure URLs are persisted in MongoDB
5. No files are written to disk and no binary data is stored in MongoDB

## Streaming

`GET /songs/:id/stream` proxies the Cloudinary media response through the backend.

Behavior:

- Supports `Range` headers for partial streaming
- Rejects invalid range headers
- Proxies upstream streaming headers back to the client
- Does not expose raw upload handling logic to clients

## Validation and Security

- Passwords are hashed with bcrypt
- JWT authentication is required for protected routes
- Role-based access control protects admin endpoints
- Zod validates request payloads and route params
- Mongoose schemas use strict mode
- Songs are soft-deleted through `isActive = false`
- Only active songs are visible to users
- Redis failures fall back to MongoDB for music state checks

## Notes

- Register creates regular users only
- To bootstrap an admin automatically, set `ADMIN_EMAIL` and `ADMIN_PASSWORD`
- `DELETE /admin/songs/:id` performs a soft delete and does not remove assets from Cloudinary
