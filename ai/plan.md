# Sonosphere - Implementation Roadmap

This document outlines the phased implementation approach for our music web app, Sonosphere, breaking down the development process into manageable stages with clear milestones and tasks.

## Phase 1: Foundation (1-2 months)
Focus on establishing the core architecture, authentication, and basic Discogs integration.

### 1.1 Project Setup
- [x] 1.1.1 Initialize Next.js project with TypeScript
- [x] 1.1.2 Configure Tailwind CSS and shadcn/ui
- [x] 1.1.3 Set up ESLint, Prettier, and Husky hooks
- [x] 1.1.4 Create Docker development environment
- [x] 1.1.5 Configure GitHub repository and initial CI/CD pipeline (GitHub Actions integrating with Vercel for frontend and Render for backend)
- [x] 1.1.6 Evaluate Supabase for PostgreSQL hosting, authentication, and S3-compatible storage to potentially accelerate backend development and reduce boilerplate.

### 1.2 Authentication
- [x] 1.2.1 Implement JWT authentication system (Leveraged Supabase Auth)
- [x] 1.2.2 Create user registration and login functionality (Using Supabase Auth)
- [x] 1.2.3 Set up OAuth2 for Discogs authorization (Initial Supabase setup for OAuth placeholder)
- [x] 1.2.4 If using Supabase, leverage its authentication features (Implemented)
- [x] 1.2.5 Build user profile page and settings (Basic profile page created)

### 1.3 Discogs Integration (Read-Only)
- [x] 1.3.1 Create Discogs API client service
- [x] 1.3.2 Implement collection retrieval (Have/Want lists) (Focused on "Have" list for now) (Placeholder implemented, full functionality depends on OAuth 1.0a)
- [x] 1.3.3 Build basic collection browser interface (Implemented using Discogs search)
- [x] 1.3.4 Add album detail view with metadata display

### 1.4 Database & API Foundation
- [x] 1.4.1 Set up PostgreSQL database (e.g., via Supabase or Render) with initial schema for users, vinyl items, etc. (SQL for Supabase provided, Prisma schema created for backend)
- [x] 1.4.2 Configure Redis for caching (e.g., via Render or another provider) (NestJS CacheModule setup for Redis, env config needed, basic interceptors applied, advanced keying/invalidation are future improvements)
- [x] 1.4.3 Create core API endpoints using NestJS for users and collections, deployable on Render. (NestJS backend foundation: Prisma, Config, VinylItems CRUD, Profiles CRUD, JWT Auth with Supabase tokens using JWKS)
- [x] 1.4.4 Implement centralized error handling middleware. (Global HTTP exception filter created in NestJS)

## Phase 2: Core Features (2-3 months)
Expand with single music service integration, scrobbling, and collection management.

### 2.1 Single Playback Integration (Spotify)
- [x] 2.1.1 Set up Spotify OAuth authentication (Supabase OAuth flow and callback handler created; manual .env setup required by user)
- [x] 2.1.2 Implement Spotify Web Playback SDK integration (Provider, types, and SDK script loading set up)
- [x] 2.1.3 Create playback controls and player UI (Basic player UI with controls, now playing, and volume slider implemented)
- [x] 2.1.4 Add basic queue management (drag-and-drop Up-Next queue) (Placeholder queue display via Sheet component created; full implementation is future work)

### 2.2 Last.fm Integration & Scrobbling
- [x] 2.2.1 Configure Last.fm API client
- [x] 2.2.2 Implement scrobbling functionality (track.updateNowPlaying, track.scrobble)
- [x] 2.2.3 Create scrobble history view
- [x] 2.2.4 Add manual scrobble edit capability (Implemented as "Add Manual Scrobble")

### 2.3 Collection Management (CRUD)
- [x] 2.3.1 Implement add/remove/update functionality for Discogs collection items locally
- [x] 2.3.2 Create collection organization features (e.g., tags, folders if desired, wishlist management) (Wishlist status, advanced tags input/filtering, and basic folder add/edit/filtering implemented; advanced folder management UI is future work)
- [x] 2.3.3 Build search and filter capabilities for the collection (Text search for title/artist, status filter, genre filter implemented)
- [x] 2.3.4 Add basic sorting options (Sort by added_at, title, artist, year; asc/desc order implemented)

### 2.4 Simple Analytics & Reporting
- [x] 2.4.1 Create basic listening statistics dashboard (Displays Top Artists, Tracks, Albums from Last.fm API with period selection)
- [x] 2.4.2 Implement play count tracking (weekly/monthly/yearly) (Displays weekly top artists/tracks/albums with play counts for that week from Last.fm)
- [x] 2.4.3 Build artist and album leaderboards (Top Artists/Tracks reports) (Covered by 2.4.1 - dashboard displays top artists/tracks/albums for various periods)
- [x] 2.4.4 Add simple data visualizations (e.g., using Recharts or D3.js) (Added Recharts bar chart for Top Artists play counts on Analytics page)

## Phase 3: Advanced Features (3-6 months)
Add richer functionality with price tracking, calendar, multi-source playback, and offline capabilities.

### 3.1 Price Tracking
- [ ] 3.1.1 Integrate CamelCamelCamel and/or Keepa APIs for Amazon price history (US & UK)
- [ ] 3.1.2 Create price history charts for vinyl records
- [ ] 3.1.3 Implement price alert system ("Droplist") with notifications
- [ ] 3.1.4 Build watchlist management UI

### 3.2 Releases Calendar
- [ ] 3.2.1 Integrate MusicBrainz API for release date information (and Cover Art Archive for thumbnails)
- [ ] 3.2.2 Create calendar view with cover art thumbnails
- [ ] 3.2.3 Implement countdown timers for upcoming releases
- [ ] 3.2.4 Add release notifications and filtering by artist/label

### 3.3 Multi-Source Playback
- [ ] 3.3.1 Add Apple Music integration (Apple MusicKit JS)
- [ ] 3.3.2 Implement YouTube playback for rare tracks (YouTube IFrame API)
- [ ] 3.3.3 Create unified search across integrated platforms
- [ ] 3.3.4 Build playback source selector UI

### 3.4 Progressive Web App (PWA) & Data Export
- [ ] 3.4.1 Configure Next.js PWA support (e.g., using `next-pwa` plugin)
- [ ] 3.4.2 Implement offline caching strategies for core data and recently accessed content
- [ ] 3.4.3 Create CSV import/export functionality for collection data
- [ ] 3.4.4 Add local storage for playback position memory ("Smart Resume")

## Phase 4: Polish & Enhancement (Ongoing)
Refine the application with AI features, gamification, lyrics, and advanced playback options.

### 4.1 AI Recommendations
- [ ] 4.1.1 Integrate with Spotify Recommendations API
- [ ] 4.1.2 Explore implementing custom recommendation algorithms (e.g., open-source ML, audio feature similarity)
- [ ] 4.1.3 Create discovery queues and personalized playlists
- [ ] 4.1.4 Add "Blasts from the Past" feature to resurface forgotten favorites

### 4.2 Gamification & Badges
- [ ] 4.2.1 Design badge system for listening milestones and achievements
- [ ] 4.2.2 Implement listening challenges to encourage discovery
- [ ] 4.2.3 Create achievement tracking and display
- [ ] 4.2.4 Allow profile customization with earned badges

### 4.3 Lyrics & Metadata Management
- [ ] 4.3.1 Integrate Musixmatch API for synchronized lyrics
- [ ] 4.3.2 Create karaoke-style synchronized lyrics display
- [ ] 4.3.3 Implement metadata correction tools (e.g., via MusicBrainz lookup, AcoustID)
- [ ] 4.3.4 Add history of metadata edits and allow user corrections

### 4.4 Advanced Playback Features
- [ ] 4.4.1 Implement gapless playback using Web Audio API
- [ ] 4.4.2 Create 5-band EQ presets using Web Audio API
- [ ] 4.4.3 Add crossfade functionality between tracks
- [ ] 4.4.4 Implement playback speed controls

### 4.5 Continuous Improvement
- [ ] 4.5.1 Set up comprehensive testing (Jest for unit/integration, Cypress for E2E)
- [ ] 4.5.2 Implement monitoring with Prometheus/Grafana (if self-hosting aspects or for backend service monitoring on Render)
- [ ] 4.5.3 Schedule regular refactoring sprints to manage technical debt
- [ ] 4.5.4 Create and maintain documentation for API and components

## Risk Mitigation Strategies
- **API Dependencies & Rate Limits**: Implement robust error handling, exponential backoff, and caching (Redis). Create fallback mechanisms.
- **Integration Complexity**: Limit to 2-3 APIs initially. Use BaaS like Supabase to reduce boilerplate for auth, database, and storage.
- **Scope Creep**: Maintain strict feature prioritization based on MVP. Time-box feature development.
- **Technical Debt**: Schedule regular refactoring sessions. Maintain comprehensive test coverage. Document architectural decisions.
- **Solo Developer Challenges**: Leverage community resources and proven libraries/frameworks. Automate repetitive tasks.

## Success Metrics (by phase completion)
- **Phase 1**: Functional authentication, read-only Discogs collection viewing, basic UI deployed on Vercel/Render.
- **Phase 2**: Daily usage potential with Spotify playback, Last.fm scrobbling, and collection CRUD.
- **Phase 3**: Regular use of price tracking, release calendar, and multi-source playback. PWA capabilities functional.
- **Phase 4**: Engagement with AI recommendations, gamification, lyrics, and overall polished experience.
