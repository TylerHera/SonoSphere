## Manual Setup Tasks for SonoSphere

This document lists tasks that require manual intervention, such as setting up external services, running commands, or installing specific tools. Each task is associated with a phase from the project plan.

---

### Phase 1.1: Project Setup (Frontend & General)

- [x] **Install Root Node.js Dependencies**
    - **Reason:** Downloads dependencies from `package.json` (Next.js, React, etc.).
    - **Instructions:**
        1. Open your terminal at the project root.
        2. Run `npm install` (or `yarn install` / `pnpm install`).

- [x] **Set up Husky Pre-commit Hooks**
    - **Reason:** Enables pre-commit checks (linting, formatting).
    - **Instructions:**
        1. Ensure root dependencies are installed (`npm install`).
        2. Make hook executable: `chmod +x .husky/pre-commit`.
        3. (Optional) Run `npm run prepare` to initialize Husky.

- [x] **Set up Supabase & Core Environment Variables (Frontend)**
    - **Reason:** Allows frontend Supabase client and other services to connect.
    - **Instructions:**
        1. Create `.env.local` in the project root if it doesn't exist.
        2. Add the following, replacing placeholder values with your actual credentials:
           ```env
           NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
           NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
           # DISCOGS_CONSUMER_KEY, DISCOGS_CONSUMER_SECRET, DISCOGS_USER_AGENT will be added in Phase 1.3
           # SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, NEXT_PUBLIC_SPOTIFY_REDIRECT_URI will be added in Phase 2.1
           # LASTFM_API_KEY, LASTFM_SHARED_SECRET, NEXT_PUBLIC_LASTFM_CALLBACK_URL will be added in Phase 2.2
           NEXT_PUBLIC_API_BASE_URL=http://localhost:3001 # Adjust if your backend runs on a different port
           ```
        3. Add these environment variables to your Vercel project settings.

- [x] **Install Base shadcn/ui Components**
    - **Reason:** Adds core UI components used in auth pages, collection view, and detail views.
    - **Instructions:**
        1. At the project root, run:
           ```bash
           npx shadcn-ui@latest add button
           npx shadcn-ui@latest add card
           npx shadcn-ui@latest add input
           npx shadcn-ui@latest add label
           npx shadcn-ui@latest add pagination
           npx shadcn-ui@latest add badge
           npx shadcn-ui@latest add select
           # Add any other components as prompted or needed during development
           ```

- [ ] **Add shadcn/ui ThemeProvider (if not already present)**
    - **Reason:** Provides light/dark mode theme switching capabilities.
    - **Instructions:**
        1. At the project root, run:
           ```bash
           npx shadcn-ui@latest add theme-provider
           ```
        2. This should create `src/components/theme-provider.tsx` and update necessary configurations.
        3. Ensure it's correctly imported and used in `src/app/layout.tsx`.

- [ ] **Install `next-pwa` Dependency**
    - **Reason:** Required for PWA functionality.
    - **Instructions:**
        1. At the project root, run `npm install` (or your package manager's install command) to install `next-pwa` and any other updated dependencies from `package.json`.

- [ ] **Run the Docker Development Environment (Optional)**
    - **Reason:** Starts the Next.js app in a Docker container (accessible at `http://localhost:3000`).
    - **Prerequisite:** Docker Desktop/Engine installed.
    - **Instructions:**
        1. At project root, run `docker-compose -f docker/docker-compose.yml up --build`.

- [ ] **Configure GitHub Repository and Vercel Deployment**
    - **Reason:** Sets up version control and CI/CD for the frontend.
    - **Instructions:**
        1. Create a new GitHub repository for this project.
        2. Initialize git in your local project: `git init`, `git add .`, `git commit -m "Initial commit"`.
        3. Add the GitHub repository as a remote and push your code.
        4. Create/login to Vercel and import the GitHub repository.
        5. Configure the Vercel project (usually auto-detected for Next.js) and deploy.

### Phase 1.3: Discogs Integration (Read-Only)

- [ ] **Set up Discogs API Credentials & User Agent**
    - **Reason:** Required for Discogs API access (collection browsing, search).
    - **Instructions:**
        1. Create a Discogs App (Settings > Developers on Discogs website) to get your Consumer Key and Consumer Secret.
        2. Define a User-Agent string for your application (e.g., `SonoSphere/0.1 +https://your-app-url-or-contact`).
        3. Add these to your `.env.local` file (and to Vercel environment variables):
           ```env
           DISCOGS_CONSUMER_KEY=your_discogs_consumer_key
           DISCOGS_CONSUMER_SECRET=your_discogs_consumer_secret
           DISCOGS_USER_AGENT=YourAppName/Version +YourAppURLOrContact
           ```

- [ ] **Implement Full Discogs OAuth 1.0a for User Data (Future Task within Discogs Integration)**
    - **Reason:** Crucial for personalized collection features like importing a user's private Discogs collection.
    - **Instructions:**
        1. This is a significant development task that involves understanding and implementing the Discogs OAuth 1.0a flow (request token, user authorization redirect, access token exchange, storing tokens securely).
        2. Refer to Discogs API documentation for details.

### Phase 1.4: Database & API Foundation (Backend)

- [x] **Set up/Update Initial Supabase Database Schema (Includes Profiles, VinylItems)**
    - **Reason:** Creates/updates the database structure for users, vinyl items, and Last.fm integration.
    - **Instructions:**
        1. In your Supabase project's SQL Editor, run the SQL scripts previously provided for `profiles` and `vinyl_items` tables, including RLS policies and triggers.
        2. **Additionally, ensure the `profiles` table includes `lastfm_session_key` and `lastfm_username` columns:**
           ```sql
           -- Add to your existing profiles table or run if table doesn't exist with these columns
           ALTER TABLE public.profiles
           ADD COLUMN IF NOT EXISTS lastfm_session_key TEXT,
           ADD COLUMN IF NOT EXISTS lastfm_username TEXT; -- Store username for API calls

           -- Ensure RLS policies for profiles allow users to update their own lastfm_session_key and lastfm_username.
           -- If your update policy is simple like: `USING (auth.uid() = id) WITH CHECK (auth.uid() = id)`
           -- then it should already cover new columns. Otherwise, adjust your policy.
           ```

- [x] **NestJS Backend Initial Setup**
    - **Reason:** Configures and prepares the NestJS backend service.
    - **Instructions:**
        1. Navigate to the `backend` directory: `cd backend`.
        2. Install backend dependencies: `npm install` (inside `backend` directory).
        3. Generate Prisma Client: `npx prisma generate` (inside `backend` directory).
        4. Create `backend/.env` file. You can copy from `backend/.env.example` (which will be created shortly) or use the structure:
           ```env
           DATABASE_URL="your_supabase_connection_string" # From Supabase Project Settings > Database (use the one that mentions Prisma)
           # REDIS_URL will be added later
           PORT=3001
           SUPABASE_URL="your_supabase_project_url" # Same as NEXT_PUBLIC_SUPABASE_URL
           SUPABASE_JWT_SECRET="your_supabase_jwt_secret" # Found in Supabase Dashboard > Project Settings > API > JWT Settings
           SUPABASE_SERVICE_ROLE_KEY="your_supabase_service_role_key" # Found in Supabase Dashboard > Project Settings > API
           # LASTFM_API_KEY will be added in Phase 2.2 if backend needs direct access
           ```
           Populate with your actual Supabase credentials.
    - **Note:** After any updates to `backend/prisma/schema.prisma`, you **must** re-run `npx prisma generate` in the `backend` directory.

- [x] **Install/Update Backend Dependencies**
    - **Reason:** Installs or updates backend Node.js dependencies from `backend/package.json`, including newly added CSV libraries.
    - **Instructions:**
        1. Navigate to the `backend` directory: `cd backend`.
        2. Run `npm install`.

- [x] **Apply Prisma Schema Changes for Vinyl Item `folder` field**
    - **Reason:** Updates the database schema to include the `folder` field for vinyl items.
    - **Instructions:**
        1. Navigate to the `backend` directory: `cd backend`.
        2. Create a new migration: `npx prisma migrate dev --name add_vinyl_item_folder` (review the generated SQL).
        3. Generate Prisma Client: `npx prisma generate`.

- [x] **Install NestJS Axios for HTTP Calls (Backend)**
    - **Reason:** Required by services like `AnalyticsService` to make HTTP requests to external APIs (e.g., Last.fm).
    - **Instructions:**
        1. Navigate to the `backend` directory (`cd backend`).
        2. Run `npm install @nestjs/axios axios`.

- [ ] **Install NestJS Swagger for API Documentation (Backend)**
    - **Reason:** Required for generating API documentation with Swagger UI.
    - **Instructions:**
        1. Navigate to the `backend` directory (`cd backend`).
        2. Run `npm install @nestjs/swagger`.

- [ ] **Set up Redis Instance for Caching (Backend)**
    - **Reason:** Enables caching in the NestJS backend to improve performance.
    - **Instructions:**
        1. Provision a Redis instance (e.g., from Upstash, Render, Aiven, or a local Docker container).
        2. Obtain the `REDIS_URL` (e.g., `redis://user:password@host:port`).
        3. Add this `REDIS_URL` to your `backend/.env` file and to the backend service's environment variables if deploying it (e.g., on Render).
           ```env
           # In backend/.env
           REDIS_URL=your_redis_connection_url
           ```

- [ ] **Apply Prisma Schema Changes for Vinyl Item `status` field**
    - **Reason:** Updates the database schema to include the `status` (e.g., 'OWNED', 'WISHLIST') for vinyl items.
    - **Instructions:**
        1. Navigate to the `backend` directory: `cd backend`.
        2. Create a new migration: `npx prisma migrate dev --name add_vinyl_item_status` (review the generated SQL).
        3. Generate Prisma Client: `npx prisma generate`.

### Phase 2.1: Single Playback Integration (Spotify)

- [ ] **Set up Spotify Developer App and Credentials**
    - **Reason:** Necessary for Spotify OAuth authentication and API access.
    - **Instructions:**
        1. Go to the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard/) and create a new application.
        2. Note your Client ID and Client Secret.
        3. Configure Redirect URIs in your Spotify App settings. For local development, add `http://localhost:3000/auth/callback/spotify`. Add the equivalent for your deployed Vercel URL.
        4. Add these credentials to your `.env.local` file (and to Vercel environment variables):
           ```env
           # In .env.local
           SPOTIFY_CLIENT_ID=your_spotify_client_id
           SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
           NEXT_PUBLIC_SPOTIFY_REDIRECT_URI=http://localhost:3000/auth/callback/spotify
           # For Vercel, you'll also add SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET,
           # and a production NEXT_PUBLIC_SPOTIFY_REDIRECT_URI
           ```

- [x] **Spotify Web Playback SDK Integration & Dependencies**
    - **Reason:** Correctly integrates the SDK as per Spotify's guidelines and provides type safety for development.
    - **Current Status:** The Spotify Web Playback SDK is loaded dynamically via a `<script>` tag in `src/components/providers/SpotifyPlayerProvider.tsx`. `@types/spotify-web-playback-sdk` is in `devDependencies`.
    - **Instructions:**
        1. Ensure frontend dependencies are installed by running `npm install` (or equivalent) at the project root after any changes to `package.json`.

- [x] **Install Recharts for Analytics Visualizations (Frontend)**
    - **Reason:** Required for rendering charts on the analytics page.
    - **Instructions:**
        1. At the project root, run `npm install recharts` (or ensure it's installed via `npm install` if it was added to `package.json`).

- [x] **Install Required shadcn/ui Components for Player & UI Features**
    - **Reason:** Provides necessary UI elements for player, forms, and notifications.
    - **Instructions:**
        1. At the project root, run:
           ```bash
           npx shadcn-ui@latest add slider
           npx shadcn-ui@latest add sonner
           npx shadcn-ui@latest add scroll-area
           npx shadcn-ui@latest add sheet
           npx shadcn-ui@latest add dialog
           npx shadcn-ui@latest add alert-dialog
           npx shadcn-ui@latest add textarea
           # Ensure all components used across forms and pages are added.
           # Base components like button, card, input, label, pagination, badge should already be installed.
           # Re-run for 'select' if it was missed or if a specific variant is needed.
           npx shadcn-ui@latest add select
           ```

### Phase 2.2: Last.fm Integration & Scrobbling

- [ ] **Set up Last.fm API Credentials**
    - **Reason:** Necessary for authenticating with the Last.fm API and scrobbling tracks.
    - **Instructions:**
        1. Go to the [Last.fm API page](https://www.last.fm/api/account/create) and create an API account.
        2. Note your API Key and Shared Secret.
        3. Add these to your `.env.local` file (and to Vercel):
           ```env
           # In .env.local
           LASTFM_API_KEY=your_lastfm_api_key
           LASTFM_SHARED_SECRET=your_lastfm_shared_secret
           NEXT_PUBLIC_LASTFM_CALLBACK_URL=http://localhost:3000/auth/callback/lastfm
           # For Vercel, add a production NEXT_PUBLIC_LASTFM_CALLBACK_URL
           ```
        4. If your NestJS backend needs to make direct calls to Last.fm (e.g., for scrobbling if not done via client), ensure `LASTFM_API_KEY` and `LASTFM_SHARED_SECRET` are also available as environment variables to your backend service (in `backend/.env`).
           ```env
           # In backend/.env (if needed)
           LASTFM_API_KEY=your_lastfm_api_key
           LASTFM_SHARED_SECRET=your_lastfm_shared_secret
           ```
    - **Note:** The callback URL is used when authenticating the user with Last.fm to get a session key.

### Phase 3.2: Releases Calendar (MusicBrainz Integration)

- [ ] **Set up MusicBrainz User Agent (Frontend)**
    - **Reason:** Required by MusicBrainz API for identifying your application.
    - **Instructions:**
        1. Decide on a User-Agent string for your application that includes your app name, version, and a way to contact you (e.g., email or a link to the project). Example: `SonoSphere/0.1 ( mailto:youremail@example.com )` or `SonoSphere/0.1 ( +https://yourprojecturl.com )`.
        2. Add this to your `.env.local` file (and Vercel environment variables):
           ```env
           NEXT_PUBLIC_MUSICBRAINZ_USER_AGENT="YourAppName/Version (ContactInfo)"
           ```
        3. Ensure this environment variable is used in your `src/lib/api/musicbrainz.ts` client.

### Phase 3.1: Price Tracking

- [ ] **Set up Price Tracking API Credentials (e.g., Keepa API)**
    - **Reason:** Required for fetching product price history from Amazon.
    - **Instructions:**
        1. Sign up for a price tracking API service that covers Amazon, such as Keepa API (CamelCamelCamel does not have a public API for direct integration).
        2. Obtain your API Key.
        3. Add the API Key to your `.env.local` file (and Vercel environment variables if frontend calls directly) or `backend/.env` (if calls are proxied via backend). For Keepa, it's usually a backend-only key.
           ```env
           # In backend/.env (recommended for Keepa)
           KEEPA_API_KEY=your_keepa_api_key
           ```
           ```env
           # Or in .env.local (if making client-side calls, less common for paid APIs)
           # NEXT_PUBLIC_KEEPA_API_KEY=your_keepa_api_key
           ```

- [ ] **Apply Prisma Schema Changes for `PriceAlert` model**
    - **Reason:** Updates the database schema to include the `PriceAlert` table for the watchlist/droplist feature.
    - **Instructions:**
        1. Navigate to the `backend` directory: `cd backend`.
        2. A new Prisma model for `PriceAlert` will be added to `backend/prisma/schema.prisma`. After it's added by the AI, run:
           `npx prisma migrate dev --name add_price_alert_table` (review the generated SQL).
        3. Generate Prisma Client: `npx prisma generate`.

- [ ] **Implement Background Price Checking Mechanism (Advanced)**
    - **Reason:** Required for the price alert system to automatically check for price drops and notify users.
    - **Instructions:**
        1. This is an advanced task. You'll need to set up a recurring job (cron job or scheduled task).
        2. Options include:
            - Using a service like Vercel Cron Jobs (for Next.js serverless functions), EasyCron, or a similar scheduler.
            - If your NestJS backend is deployed on a platform like Render, it might offer cron job features.
            - A dedicated microservice for background tasks.
        3. The job should query `PriceAlert` items, fetch current prices using the Keepa (or other) API, compare with `target_price`, and trigger notifications (e.g., update a flag in the DB, send an email - email setup is separate).

### Phase 3.3: Multi-Source Playback

- [ ] **Set up Apple Music Developer Token**
    - **Reason:** Required to authenticate and interact with the Apple Music API using MusicKit JS.
    - **Instructions:**
        1. You need an Apple Developer account.
        2. Generate a MusicKit Identifier and a Private Key from your Apple Developer account (Certificates, Identifiers & Profiles -> Keys).
        3. Use this key to generate a Developer Token. This token is typically short-lived (max 6 months) or can be generated on demand by a backend. For frontend-only usage with MusicKit JS, you'll use a developer token.
        4. Refer to Apple's official documentation on "Creating MusicKit Keys and Developer Tokens".
        5. Add the generated Developer Token to your `.env.local` file (and Vercel environment variables):
           ```env
           NEXT_PUBLIC_APPLE_DEVELOPER_TOKEN=your_apple_developer_token
           ```
    - **Security Note:** Developer tokens have significant access. If possible for a production app, generate them on a server and provide them to the client securely, rather than embedding a long-lived one directly via environment variables accessible to the client.

### Phase 3.4: Progressive Web App (PWA) & Data Export

- [ ] **Install `next-pwa` Dependency**
    - **Reason:** Required for PWA functionality.
    - **Instructions:**
        1. At the project root, run `npm install` (or your package manager's install command) to install `next-pwa` and any other updated dependencies from `package.json`.

### Phase 4.1: AI Recommendations

- [ ] **Set up Spotify API Credentials (if not already done for Playback)**
    - **Reason:** Required for fetching recommendations and track/artist data from Spotify Web API.
    - **Instructions:**
        1. Ensure `SPOTIFY_CLIENT_ID` and `SPOTIFY_CLIENT_SECRET` are in your `.env.local` (and Vercel env vars) as detailed in Phase 2.1. These are used by the backend/server-side logic to obtain an access token for API calls.

- [ ] **Install `@types/spotify-api` for TypeScript**
    - **Reason:** Provides TypeScript definitions for the Spotify Web API, which are necessary for `SpotifyApi.AudioFeaturesObject` and other related types used in recommendation features.
    - **Instructions:**
        1. At the project root, run:
           ```bash
           npm install --save-dev @types/spotify-api
           ```
        2. Ensure your `tsconfig.json` allows for global types from `node_modules/@types` or specifically includes `spotify-api` if needed (usually automatic).

- [ ] **(Potentially) Add `KEEPA_API_KEY` to Backend Environment**
    - **Reason:** Required if Keepa integration for price tracking is fully implemented and needs an API key.

### Phase 4.2: Gamification & Badges

- [ ] **Apply Prisma Schema Changes for Badge and UserBadge models**
    - **Reason:** Updates the database schema to include the `Badge` and `UserBadge` tables for the gamification system.
    - **Instructions:**
        1. Navigate to the `backend` directory: `cd backend`.
        2. The `Badge` and `UserBadge` Prisma models have been added to `backend/prisma/schema.prisma`. Run:
           `npx prisma migrate dev --name add_gamification_tables` (review the generated SQL).
        3. Generate Prisma Client: `npx prisma generate`.

- [ ] **Apply Prisma Schema Changes for Showcased Badges on Profile**
    - **Reason:** Updates the `Profile` model in the database schema to allow users to select badges to display on their profile.
    - **Instructions:**
        1. Navigate to the `backend` directory: `cd backend`.
        2. The `Profile` model has been updated in `backend/prisma/schema.prisma`. Run:
           `npx prisma migrate dev --name add_showcased_badges_to_profile` (review the generated SQL).
        3. Generate Prisma Client: `npx prisma generate`.

### Phase 4.3: Lyrics & Metadata Management

- [ ] **Set up Musixmatch API Key**
    - **Reason:** Required for fetching synchronized lyrics.
    - **Instructions:**
        1. Sign up for a Musixmatch Developer account and obtain an API key.
        2. Add the API key to your `.env.local` file (and Vercel environment variables):
           ```env
           NEXT_PUBLIC_MUSIXMATCH_API_KEY=your_musixmatch_api_key
           ```
        3. Note: If API calls are later moved to the backend, this key might need to be in `backend/.env` instead and not be public.

### Phase 4.5: Continuous Improvement

- [ ] **Install Testing Framework Dependencies (Jest & Cypress)**
    - **Reason:** Required for running unit, integration, and E2E tests.
    - **Instructions:**
        1. Ensure you are in the project root directory.
        2. Run `npm install` (or your package manager's install command) to install Jest, Cypress, and their related dependencies that were added to `package.json`.
        3. For Cypress, you might need to run `npx cypress open` once to allow it to scaffold its necessary directory structure if it hasn't been run before.

- [ ] **Run Initial Tests (Jest & Cypress)**
    - **Reason:** To verify that the testing frameworks are set up correctly.
    - **Instructions:**
        1. For Jest: `npm test` (or `npm run test:watch` for interactive mode).
        2. For Cypress E2E (headless): `npm run test:e2e` (this will start the dev server and run tests).
        3. For Cypress (interactive): `npx cypress open` (ensure dev server `npm run dev` is running in another terminal).

- [ ] **Set Up Application Monitoring**
    - **Reason:** To track application performance, errors, and user activity for continuous improvement.
    - **Instructions:**
        1.  **Vercel Analytics (Frontend):** Enabled by default for projects deployed on Vercel. Review the Vercel dashboard for your project to see basic analytics and Core Web Vitals.
        2.  **Render Monitoring (Backend):** Render provides built-in metrics for services deployed on its platform (CPU, memory, network, disk). Check your service dashboard on Render.
        3.  **Sentry.io (Optional but Recommended - Frontend & Backend):**
            *   Sign up for a free Sentry account at [sentry.io](https://sentry.io).
            *   Create separate projects in Sentry for your Next.js frontend and NestJS backend.
            *   Follow Sentry's documentation to install and initialize the Sentry SDK in your frontend (`src/app/layout.tsx` or a dedicated init file) and backend (`src/main.ts` for NestJS).
            *   Ensure Sentry DSNs are stored securely as environment variables (`SENTRY_DSN` or `NEXT_PUBLIC_SENTRY_DSN` for frontend, `SENTRY_DSN` for backend).
            *   This will provide detailed error tracking, release health, and performance monitoring.

- [ ] **Schedule Regular Refactoring**
    - **Reason:** To maintain code health, address technical debt, and improve overall application quality.
    - **Instructions:**
        1.  **Process:** This is an ongoing team/developer discipline rather than a one-time setup.
        2.  **Cadence:** Consider dedicating a small percentage of each sprint/development cycle to refactoring, or schedule dedicated refactoring "sprints" periodically (e.g., after every major phase completion or every few months).
        3.  **Focus Areas:** Identify areas with high complexity, bugs, performance bottlenecks, or outdated patterns. Use static analysis tools, code metrics, and team feedback to guide this.
        4.  **Tracking:** Add specific refactoring tasks to your backlog/issue tracker like any other development task.

- [ ] **Establish Documentation Practices**
    - **Reason:** To ensure the codebase, APIs, and components are well-understood, maintainable, and usable by others (or future self).
    - **Instructions:**
        1.  **Code Comments (JSDoc/TSDoc):** Encourage consistent use of JSDoc/TSDoc for functions, classes, types, and complex logic in both frontend (TypeScript/React) and backend (NestJS/TypeScript) code.
        2.  **Component Documentation (Storybook - Frontend):**
            *   Consider setting up Storybook for your React components (`src/components`). This allows interactive viewing and documentation of UI components in isolation.
            *   Install Storybook: `npx storybook@latest init` (follow prompts).
            *   Write "stories" for common/reusable components.
        3.  **API Documentation (Swagger/OpenAPI - Backend):**
            *   Ensure the NestJS backend has `@nestjs/swagger` setup (a previous manual task). 
            *   Use decorators (`@ApiProperty`, `@ApiOperation`, `@ApiResponse`, etc.) in DTOs and controllers to generate comprehensive API documentation.
            *   Regularly verify that the `/api-docs` endpoint (or equivalent) on your backend is up-to-date and reflects the current API structure.
        4.  **Markdown Documents:** Keep `README.md` updated with project setup, running instructions, and an overview. Continue to maintain planning documents (`ai/plan.md`, `ai/prd.md`) and manual task lists (`ai/manual_setup_tasks.md`) as the project evolves.
        5.  **Architectural Decisions:** Document significant architectural choices and their rationale in a dedicated place (e.g., a `docs/architecture.md` file or a wiki if using one).

### Future / Ongoing Tasks

- [ ] **Address Supabase RLS/Policy Issues and Advanced Testing**
    - **Reason:** Ensure database security is robust and application is thoroughly tested.
    - **Instructions:**
        1.  **Supabase RLS/Policies:** Review and refine all Row Level Security policies in Supabase for all tables, ensuring users can only access and modify data they are permitted to. Pay close attention to policies for `profiles`, `vinyl_items`, and the upcoming `price_alerts`. Test these policies thoroughly using different user roles or scenarios.
        2.  **Advanced Testing:** Implement a more comprehensive testing strategy.
            *   **Unit Tests (Jest):** Increase coverage for frontend components, utility functions, and backend services/controllers.
            *   **Integration Tests (Jest/Supertest for backend, React Testing Library for frontend):** Test interactions between different parts of the application (e.g., API endpoint calls from frontend services, service interactions in backend).
            *   **End-to-End Tests (Cypress):** Create E2E tests for critical user flows like authentication, collection management, playback, scrobbling, and price alert setup.

### Phase 4.1: AI Recommendations (Continued)

- [ ] **Install shadcn/ui Components for Recommendations Search**
    - **Reason:** Adds `Popover` and `Command` components used for the search-as-you-type UI for selecting seed artists and tracks.
    - **Instructions:**
        1. At the project root, run:
           ```bash
           npx shadcn-ui@latest add popover
           npx shadcn-ui@latest add command
           npx shadcn-ui@latest add slider # Ensure slider is added if not already present
           ```

- [ ] **Backend ML Exploration (Future Task for Custom Recommendations)**
    - **Reason:** For more advanced Machine Learning models (e.g., collaborative filtering on larger datasets, complex feature engineering) that might be too resource-intensive or complex for client-side JavaScript.
    - **Instructions:**
        1. Research and decide on a Python backend framework (e.g., Flask, FastAPI) suitable for ML model serving.
        2. Explore deployment options (e.g., Render, Google Cloud Functions, AWS Lambda) for this microservice.
        3. Select and implement appropriate ML libraries (e.g., scikit-learn, TensorFlow, PyTorch, Surprise for recommendation systems).
        4. Develop API endpoints for the frontend to fetch these advanced recommendations.
        5. Consider data storage and preprocessing needs for the ML models.

- [ ] **Comprehensive Data Aggregation Pipeline (Future Task for Custom Recommendations)**
    - **Reason:** To effectively combine large datasets from Last.fm, Spotify, and the local vinyl collection for sophisticated recommendation models that require a unified view of user preferences and item features.
    - **Instructions:**
        1. Design a data schema for storing aggregated user listening patterns, item features, and derived insights.
        2. Develop scripts or services (potentially backend/serverless) to periodically fetch, process, and normalize data from all relevant APIs (Last.fm, Spotify) and the local database.
        3. Implement strategies for updating this aggregated data and handling API rate limits and data synchronization challenges.
        4. Store the processed data in a suitable database (e.g., PostgreSQL, or a NoSQL DB if better suited for feature vectors) accessible by the recommendation engine.

- [ ] **Apply Prisma Schema Changes for Challenge and UserChallenge models**
    - **Reason:** Updates the database schema to include tables for the listening challenges system.
    - **Instructions:**
        1. Navigate to the `backend` directory: `cd backend`.
        2. The `Challenge`, `UserChallenge` models and `ChallengeStatus` enum have been added to `backend/prisma/schema.prisma`. Run:
           `npx prisma migrate dev --name add_challenge_tables` (review the generated SQL).
        3. Generate Prisma Client: `npx prisma generate`.

- [ ] **Apply Prisma Schema Changes for Metadata Edit History**
    - **Reason:** Adds a table to log changes made to item metadata.
    - **Instructions:**
        1. Navigate to the `backend` directory: `cd backend`.
        2. The `MetadataEditHistory` model has been added to `backend/prisma/schema.prisma`. Run:
           `npx prisma migrate dev --name add_metadata_edit_history` (review the generated SQL).
        3. Generate Prisma Client: `npx prisma generate`.

---

Please ensure you complete any pending tasks from earlier phases if they block current development. The "Future / Ongoing Tasks" are items to be addressed as development progresses or after core features are implemented.
