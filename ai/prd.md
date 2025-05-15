# Sonosphere - Product Requirements Document

## 1. Introduction

This document outlines the requirements for Sonosphere, a personal music web application that integrates vinyl collection management, streaming services, scrobbling, price tracking, and analytics in one comprehensive platform.

### 1.1 Purpose

To create a unified music hub for personal use that centralizes collection management, playback, and music discovery across multiple platforms.

### 1.2 Scope

The application will integrate with Discogs, Last.fm, Spotify, Apple Music, MusicBrainz, Cover Art Archive, price tracking services (CamelCamelCamel, Keepa), and lyrics services (Musixmatch) to provide a complete music management experience.
Will use Render, Supabase and Vercel (free tier) for frontend. backend and database.

### 1.3 Definitions

- **Scrobbling**: The process of tracking music listening history, typically to Last.fm.
- **Droplist**: A watchlist for price alerts on vinyl records.
- **EQ**: Equalizer for audio adjustment.
- **PWA**: Progressive Web Application.
- **BaaS**: Backend as a Service (e.g., Supabase).

## 2. User Personas

### 2.1 Primary User: The Developer

A music enthusiast and vinyl collector who:

- Maintains a vinyl collection (potentially on Discogs).
- Uses streaming services like Spotify and Apple Music.
- Tracks listening history via Last.fm.
- Monitors vinyl prices for collection additions.
- Values detailed listening statistics and music discovery.
- Desires organized metadata and a seamless user experience.

## 3. User Stories

### 3.1 Vinyl Collection Management

- **US-1.1**: As a user, I want to import and view my Discogs collection (Have/Want lists) in a clean interface.
- **US-1.2**: As a user, I want to organize my vinyl collection with tags, custom folders, and filtering options.
- **US-1.3**: As a user, I want to add, edit, and remove items from my collection manually.
- **US-1.4**: As a user, I want to search and browse my collection efficiently by various attributes (artist, title, genre, etc.).

### 3.2 Price Tracking

- **US-2.1**: As a user, I want to track price histories for vinyl records on my watchlist (Droplist) from services like CamelCamelCamel and Keepa.
- **US-2.2**: As a user, I want to receive alerts when prices drop below my defined threshold.
- **US-2.3**: As a user, I want to visualize price trends over time for specific records.
- **US-2.4**: As a user, I want to quickly access purchase links when good deals appear.

### 3.3 Releases Calendar

- **US-3.1**: As a user, I want to view upcoming music releases from my favorite artists or by date in a calendar format, using data from MusicBrainz.
- **US-3.2**: As a user, I want to see cover art thumbnails (from Cover Art Archive) for upcoming releases.
- **US-3.3**: As a user, I want countdown timers for highly anticipated releases.
- **US-3.4**: As a user, I want to filter releases by artists I follow or by genre.

### 3.4 Playback & Scrobbling

- **US-4.1**: As a user, I want to play music from Spotify, Apple Music, and YouTube within one unified interface.
- **US-4.2**: As a user, I want my listening activity to be scrobbled to Last.fm automatically, regardless of the source.
- **US-4.3**: As a user, I want to edit or delete scrobble data when needed.
- **US-4.4**: As a user, I want gapless playback, crossfade options, and custom EQ presets (e.g., 5-band EQ).
- **US-4.5**: As a user, I want a drag-and-drop "Up Next" queue and smart resume of playback position.

### 3.5 Analytics & Reports

- **US-5.1**: As a user, I want detailed listening statistics (daily/weekly/monthly/yearly reports).
- **US-5.2**: As a user, I want visual representations of my listening habits (e.g., genre distribution, top artists/albums/tracks) using libraries like Recharts or D3.js.
- **US-5.3**: As a user, I want to discover patterns in my music consumption and see trend evolution.
- **US-5.4**: As a user, I want a "Blasts from the Past" feature to rediscover music I haven't played recently.

### 3.6 AI & Gamification

- **US-6.1**: As a user, I want personalized music recommendations based on my listening history (potentially using Spotify API or open-source ML).
- **US-6.2**: As a user, I want to earn badges for listening milestones and completing challenges.
- **US-6.3**: As a user, I want listening challenges that encourage me to expand my musical horizons.
- **US-6.4**: As a user, I want to track my progress in various listening goals and see my achievements.

### 3.7 Metadata & Lyrics

- **US-7.1**: As a user, I want accurate metadata for my music, with options for auto-correction via MusicBrainz/AcoustID.
- **US-7.2**: As a user, I want to see synchronized, karaoke-style lyrics (via Musixmatch API) while listening.
- **US-7.3**: As a user, I want to be able to manually correct inaccurate metadata and have an edit history.
- **US-7.4**: As a user, I want to search for lyrics within my collection.

### 3.8 User Interface & Extras

- **US-8.1**: As a user, I want a dark mode toggle and a responsive design for all screen sizes.
- **US-8.2**: As a user, I want dynamic accent colors in the theme, extracted from album art (e.g., via Color Thief).
- **US-8.3**: As a user, I want customizable dashboard layouts and keyboard shortcuts for common actions.
- **US-8.4**: As a user, I want to import/export my collection data (e.g., CSV, JSON).

### 3.9 Mobile & Offline (PWA)

- **US-9.1**: As a user, I want to access basic features like collection browsing and cached playback offline via a PWA.
- **US-9.2**: As a user, I want a mobile-optimized experience with touch controls.
- **US-9.3**: As a user, I want to install the app on my mobile home screen.
- **US-9.4**: As a user, I want push notifications for important alerts (e.g., price drops, new releases).

## 4. Feature Requirements

### 4.1 Vinyl Collection & Price Tracking

#### 4.1.1 Discogs Integration & Collection CRUD

- Connect to Discogs API to retrieve and import user's collection (Have/Want lists).
- Display collection with cover art, metadata, and user-defined tags/folders.
- Allow full CRUD operations (Add, Read, Update, Delete) on collection items locally.
- Implement robust search, filtering, and sorting for the collection.
- Support Wishlist management.

#### 4.1.2 Price Tracking

- Integrate CamelCamelCamel and/or Keepa APIs for Amazon (US/UK) vinyl price history.
- Display price history charts for items in the collection or on a watchlist.
- Implement a "Droplist" alert system for price drops below a user-set threshold.
- Support multiple currency display where applicable.

### 4.2 Releases Calendar & Metadata Management

#### 4.2.1 Releases Calendar

- Integrate MusicBrainz API for upcoming release date information and Cover Art Archive for thumbnails.
- Display an interactive calendar view with cover art, release details, and countdown timers.
- Allow filtering by followed artists, genre, or label, with notification options.

#### 4.2.2 Metadata Management

- Validate and auto-correct metadata via MusicBrainz API and AcoustID.
- Allow manual metadata editing with an audit trail (edit history).
- Link to external sources (MusicBrainz, Discogs) for additional information.
- Support custom notes on collection items.
- Display synchronized lyrics via Musixmatch API (karaoke-style).
- Support lyrics search.

### 4.3 Playback & Scrobbling

#### 4.3.1 Multi-Source Playback

- Integrate Spotify Web Playback SDK.
- Implement Apple MusicKit JS integration.
- Add YouTube iframe API for playback of rare tracks/videos.
- Create a unified player interface with consistent controls across services.

#### 4.3.2 Scrobbling

- Connect to Last.fm API for scrobbling (track.updateNowPlaying and track.scrobble).
- Allow manual scrobble editing and deletion.
- Option to import historical scrobble data (e.g., from JSON dumps).

#### 4.3.3 Advanced Playback Features

- Implement gapless playback and crossfade options using Web Audio API.
- Create a 5-band EQ with presets.
- Implement "Smart Resume" for playback position memory across sessions/devices.
- Manage an "Up Next" queue with drag-and-drop reordering.

### 4.4 Analytics & Reporting

#### 4.4.1 Listening Statistics

- Track and display play counts by artist, album, track across all scrobbled sources.
- Generate visual representations (charts, graphs using Recharts/D3.js) of listening habits.
- Implement time-based analysis (weekly, monthly, yearly trends).
- Generate shareable listening reports.

#### 4.4.2 Discovery Features

- Create a "Blasts from the Past" algorithm to resurface unplayed music from the user's collection/history.
- Highlight listening trends and significant changes in habits over time.
- Compare digital listening habits to physical collection.

### 4.5 AI Recommendations & Gamification

#### 4.5.1 Recommendation Engine

- Leverage Spotify Recommendations API for new music suggestions.
- Explore implementing custom recommendation algorithms (e.g., audio feature similarity, collaborative filtering if user base grows, or open-source ML models).
- Generate personalized discovery playlists and mood-based suggestions.

#### 4.5.2 Gamification

- Design an achievement system with badges for listening milestones (e.g., discover X new artists, listen for Y hours).
- Create periodic listening challenges to encourage music exploration.
- Track and display progress on challenges and earned badges on user profile.

### 4.6 User Interface (UI) & User Experience (UX)

#### 4.6.1 General UI/UX

- Implement a responsive design for optimal viewing on desktop, tablet, and mobile.
- Offer a dark mode toggle.
- Utilize animations for smooth state transitions (e.g., with Framer Motion).
- Ensure keyboard accessibility and shortcuts for common actions.

#### 4.6.2 Customization

- Extract dynamic accent colors from album art for theming (e.g., using Color Thief library).
- Allow manual theme customization options.
- Support customizable dashboard layouts with a widget-based home screen.

### 4.7 Progressive Web App (PWA) Features

#### 4.7.1 Offline Capabilities

- Implement a service worker for offline access (e.g., using `next-pwa` or similar).
- Cache collection data, recently played tracks, and frequently accessed content for offline use.
- Support offline playback of downloaded/cached content if feasible.
- Background sync for scrobbles when connectivity is restored.

#### 4.7.2 Mobile Experience

- Create an app manifest for "Add to Home Screen" functionality.
- Optimize touch controls for mobile navigation and interaction.
- Implement push notifications for alerts (price drops, new releases) if desired by the user.

### 4.8 Data Management

- Implement CSV and/or JSON import/export functionality for collection data.
- Consider basic backup and restore options for user data (especially if not fully reliant on external services).
- Support batch operations for metadata editing or collection management where appropriate.

## 5. Data Models

- **User**: `id`, `username`, `email`, `password_hash` (if local auth), `oauth_tokens` (JSONB for Spotify, Last.fm, etc.), `preferences` (JSONB for theme, notifications, etc.), `created_at`, `updated_at`.
- **VinylItem**: `id`, `user_id` (FK to User), `discogs_id` (optional), `title`, `artist_main` (text), `artists_extra` (JSONB), `release_title`, `year`, `formats` (JSONB), `labels` (JSONB), `genres` (text[]), `styles` (text[]), `cover_url_small`, `cover_url_large`, `status` (e.g., 'owned', 'wishlist'), `added_at`, `notes` (text), `custom_tags` (text[]).
- **PriceAlert** (Droplist Item): `id`, `vinyl_item_id` (FK to VinylItem), `user_id` (FK to User), `target_price` (decimal), `currency` (char(3)), `current_price` (decimal), `retailer` (e.g., 'Amazon US', 'Amazon UK', 'DiscogsMP'), `url_to_item` (text), `last_checked_at`, `alert_active` (boolean), `created_at`.
- **ReleaseEvent**: `id`, `musicbrainz_release_group_id` (or similar unique ID), `artist_name`, `release_title`, `release_date`, `cover_art_url` (from Cover Art Archive), `type` (e.g., 'album', 'ep'), `followed_by_user_id` (optional FK to User if tracking specific interests), `preorder_links` (JSONB).
- **Scrobble**: `id`, `user_id` (FK to User), `track_name`, `artist_name`, `album_name`, `album_artist_name`, `timestamp` (when played), `source` (e.g., 'Spotify', 'AppleMusic', 'Manual'), `duration_ms` (optional), `musicbrainz_track_id` (optional), `imported_at`.
- **PlaybackSession**: `id`, `user_id` (FK to User), `track_identifier` (e.g., Spotify URI, Apple Music ID), `track_name`, `artist_name`, `album_name`, `current_position_ms`, `total_duration_ms`, `device_name` (optional), `last_updated_at`.
- **Badge**: `id`, `name`, `description`, `icon_url`, `criteria` (JSONB).
- **UserBadge**: `id`, `user_id` (FK to User), `badge_id` (FK to Badge), `awarded_at`.
- **Artist**: `id`, `musicbrainz_artist_id` (unique), `name`, `disambiguation` (optional), `country` (optional), `type` (e.g. 'Person', 'Group').
- **Album**: `id`, `musicbrainz_release_group_id` (unique), `title`, `primary_artist_id` (FK to Artist), `release_date`, `album_type` (e.g. 'Album', 'EP').
- **Track**: `id`, `musicbrainz_recording_id` (unique), `title`, `primary_artist_id` (FK to Artist), `album_id` (FK to Album), `duration_ms`, `track_number`.

_Note: Data models will evolve. FKs (Foreign Keys) imply relationships. JSONB for flexible structured data._

## 6. Non-Functional Requirements

### 6.1 Performance

- **NFR-1.1**: Initial page load (LCP) under 2.5 seconds on desktop/mobile with good network.
- **NFR-1.2**: API response time under 300ms for most operations; interactive UI elements sub-100ms.
- **NFR-1.3**: Smooth animations and scrolling at 60fps.
- **NFR-1.4**: Support for at least 10,000 records in collection without significant UI degradation (achieved via pagination, virtualization).

### 6.2 Security

- **NFR-2.1**: Secure storage and handling of API keys and OAuth tokens (e.g., using environment variables, secure backend storage, HTTPOnly cookies for session tokens).
- **NFR-2.2**: Implementation of HTTPS for all communications.
- **NFR-2.3**: Protection against common web vulnerabilities (XSS, CSRF, SQLi) through framework defaults and best practices.
- **NFR-2.4**: Regular review of dependencies for security vulnerabilities.

### 6.3 Reliability

- **NFR-3.1**: Graceful handling of third-party API failures and rate limits (e.g., with retries, backoff, circuit breakers, user notifications).
- **NFR-3.2**: Comprehensive error logging and monitoring (e.g., Sentry, or platform-specific tools on Vercel/Render).
- **NFR-3.3**: Data backup and recovery procedures (leveraging Supabase/Render capabilities).
- **NFR-3.4**: Aim for high availability, leveraging platform capabilities.

### 6.4 Scalability

- **NFR-4.1**: Efficient database query optimization and indexing for growing collection sizes.
- **NFR-4.2**: Modular architecture to facilitate adding new features or integrations.
- **NFR-4.3**: Use of caching (Redis, CDN for static assets via Vercel) to reduce load and improve response times.

### 6.5 Maintainability

- **NFR-5.1**: Comprehensive test coverage: Unit tests (>80%), Integration tests for critical paths, E2E tests for key user flows (Jest, Cypress).
- **NFR-5.2**: Clear code documentation (JSDoc/TSDoc), comments for complex logic, and up-to-date READMEs.
- **NFR-5.3**: Consistent coding standards enforced by linters (ESLint) and formatters (Prettier).
- **NFR-5.4**: Regular technical debt assessment and refactoring scheduled into development cycles.

## 7. Technical Specifications & Stack

### 7.1 Frontend

- **Framework**: Next.js (React) with TypeScript.
- **Styling**: Tailwind CSS.
- **UI Components**: shadcn/ui, custom components.
- **State Management**: React Query (for server state), Zustand (for client state).
- **Animations**: Framer Motion.
- **PWA**: `next-pwa` or similar Next.js compatible PWA plugin.
- **Deployment**: Vercel.

### 7.2 Backend

- **Platform**: Node.js.
- **Framework**: NestJS with TypeScript.
- **API**: RESTful APIs (primary), GraphQL (optional for specific use cases if beneficial).
- **Authentication**: JWT for local sessions, OAuth2 for third-party service integration (Spotify, Apple Music, Last.fm, Discogs).
- **Error Handling**: Centralized middleware, retry/backoff for external API calls.
- **Deployment**: Render.

### 7.3 Data & Storage

- **Primary Database**: PostgreSQL (hosted on Supabase or Render).
- **Cache**: Redis (hosted on Render or a dedicated cache provider).
- **Object Storage**: S3-compatible service (e.g., Supabase Storage, AWS S3, or Render Object Storage if available) for cover art, user media uploads.
- **ORM/Query Builder**: Prisma (recommended for NestJS with PostgreSQL) or TypeORM.

### 7.4 DevOps & Tools

- **Containerization**: Docker (for local development consistency).
- **CI/CD**: GitHub Actions (triggering deployments to Vercel for frontend, Render for backend).
- **Monitoring**: Prometheus & Grafana (for deeper insights if self-hosting parts or for backend service monitoring on Render); Vercel/Render built-in analytics.
- **Testing**: Jest (unit/integration), Cypress (E2E).
- **BaaS**: Supabase (for PostgreSQL, Auth, Storage - leveraging free tiers).

### 7.5 Key Third-Party APIs

- **Discogs API**: Vinyl collection data.
- **CamelCamelCamel / Keepa APIs**: Amazon price tracking.
- **Last.fm API**: Scrobbling and listening history.
- **Spotify Web API & Web Playback SDK**: Streaming, recommendations, library access.
- **Apple MusicKit JS & API**: Apple Music playback and library access.
- **YouTube IFrame API**: YouTube playback.
- **MusicBrainz API**: Metadata, release information.
- **Cover Art Archive API**: Album cover art.
- **Musixmatch API**: Synchronized lyrics.

## 8. Assumptions & Constraints

- User has active accounts on the third-party services they wish to integrate (Spotify, Last.fm, etc.).
- Third-party APIs remain reasonably stable, available, and adhere to their documented rate limits and terms of service. Free tier limitations of these APIs are acknowledged.
- The application is primarily for a single user (the developer), simplifying some aspects of multi-tenancy and scaling, though good practices will be followed.
- Focus on modern evergreen browsers for compatibility.
- Development will leverage free tiers of Vercel, Render, and Supabase where possible.

## 9. Success Criteria (Minimum Viable Product - End of Phase 2/3)

- Successful import and display of Discogs collection with CRUD operations.
- Functional playback from at least one primary streaming service (e.g., Spotify) integrated into the app.
- Working scrobbling to Last.fm with editing capabilities.
- Basic analytics dashboard with key listening visualizations.
- Price tracking for selected vinyl records with a functional alert system (Droplist).
- Upcoming releases calendar populated with data.
- PWA capabilities allowing for basic offline collection viewing and home screen installation.
- Dark mode and responsive design implemented.

## 10. Out of Scope (Initially)

- Extensive social features (sharing, following other users within Sonosphere).
- Multi-user support beyond the primary developer account.
- Public API for Sonosphere itself.
- Native mobile applications (focus on PWA).
- Music fingerprinting for identification (rely on metadata from services).
- Audio format conversion or music production tools.
- Management of other physical media like CDs/cassettes (vinyl-first focus).
