## Manual Setup Tasks for SonoSphere

This document lists tasks that require manual intervention, such as setting up external services, running commands, or installing specific tools.

---

## ✅ Assumed Completed Tasks

These tasks should have been completed based on the project progression. Please verify they are done to ensure the application functions as expected.

### Phase 1.1: Project Setup (Frontend & General)

1.  **Install Root Node.js Dependencies:**

    - **Instruction:** Open your terminal at the project root and run `npm install` (or `yarn install` / `pnpm install`).
    - **Reason:** Downloads dependencies from `package.json` (Next.js, React, etc.).

2.  **Set up Husky Pre-commit Hooks:**

    - **Instruction 1:** Ensure root dependencies are installed (`npm install`).
    - **Instruction 2:** Make hook executable: `chmod +x .husky/pre-commit`
    - **Instruction 3 (Optional):** Run `npm run prepare` to initialize Husky.
    - **Reason:** Enables pre-commit checks (linting, formatting).

3.  **Set up Supabase Environment Variables (Frontend):**

    - **Instruction:** Create `.env.local` in the project root. Add:
      ```env
      NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
      NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
      DISCOGS_CONSUMER_KEY=your_discogs_consumer_key
      DISCOGS_CONSUMER_SECRET=your_discogs_consumer_secret
      DISCOGS_USER_AGENT=YourAppName/Version +YourAppURLOrContact
      SPOTIFY_CLIENT_ID=your_spotify_client_id
      SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
      NEXT_PUBLIC_SPOTIFY_REDIRECT_URI=http://localhost:3000/auth/callback/spotify
      LASTFM_API_KEY=your_lastfm_api_key
      LASTFM_SHARED_SECRET=your_lastfm_shared_secret
      NEXT_PUBLIC_LASTFM_CALLBACK_URL=http://localhost:3000/auth/callback/lastfm
      NEXT_PUBLIC_API_BASE_URL=http://localhost:3001 # Adjust if your backend runs on a different port
      ```
      Replace with your Supabase Project URL and Anon Key (from Supabase Dashboard > Project Settings > API).
    - **Also add these to Vercel project environment variables.**
    - **Reason:** Allows frontend Supabase client to connect.

4.  **Install Base shadcn/ui Components:**
    - **Instruction:** At the project root, run:
      ```bash
      npx shadcn-ui@latest add button
      npx shadcn-ui@latest add card
      npx shadcn-ui@latest add input
      npx shadcn-ui@latest add label
      npx shadcn-ui@latest add pagination
      npx shadcn-ui@latest add badge
      npx shadcn-ui@latest add select
      # Add any other components as prompted or needed
      ```
    - **Reason:** Adds core UI components used in the auth pages, collection view, and detail views.

### Phase 1.4: Database & API Foundation (Backend)

1.  **Set up/Update Initial Supabase Database Schema:**

    - **Instruction:** In your Supabase project's SQL Editor, run the SQL scripts previously provided. **Additionally, add the `lastfm_session_key` column to your `profiles` table if you haven't already:**

      ```sql
      -- Add to your existing profiles table or run if table doesn't exist with this column
      ALTER TABLE public.profiles
      ADD COLUMN IF NOT EXISTS lastfm_session_key TEXT,
      ADD COLUMN IF NOT EXISTS lastfm_username TEXT; -- Store username for API calls

      -- Ensure RLS policies for profiles allow users to update their own lastfm_session_key and lastfm_username
      -- If you re-create the policy, ensure it covers these new columns for update.
      -- Example update to existing policy (or part of a new one):
      -- CREATE POLICY "Users can update their own profile" ON public.profiles
      --   FOR UPDATE USING (auth.uid() = id)
      --   WITH CHECK (auth.uid() = id AND char_length(username) >= 3);
      -- The above needs to be modified to allow updating lastfm_session_key and lastfm_username.
      -- A simpler way if you have granular policies already:
      -- Make sure the existing UPDATE policy on public.profiles includes lastfm_session_key and lastfm_username in the USING and WITH CHECK clauses if necessary,
      -- or that it allows updates to these columns based on auth.uid() = id.
      -- If your update policy is simple like: `USING (auth.uid() = id) WITH CHECK (auth.uid() = id)`
      -- then it should already cover new columns.
      ```

    - **Reason:** Creates/updates the database structure for storing Last.fm session keys and usernames.

2.  **NestJS Backend Initial Setup:**

    - **Instruction 1:** Navigate to the `backend` directory: `cd backend`
    - **Instruction 2:** Install backend dependencies: `npm install` (inside `backend` directory).
    - **Instruction 3:** Generate Prisma Client: `npx prisma generate` (inside `backend` directory).
    - **Instruction 4:** Create `backend/.env` file. Copy the content from `backend/.env.example` (if it exists) or use the structure previously provided, and populate with your:
      - `DATABASE_URL` (from Supabase Project Settings > Database)
      - `REDIS_URL` (you'll set this up in "Pending Tasks")
      - `PORT` (e.g., 3001)
      - `SUPABASE_URL` (same as `NEXT_PUBLIC_SUPABASE_URL`)
      - `SUPABASE_JWT_AUDIENCE` (usually "authenticated")
    - **Reason:** Configures and prepares the NestJS backend service.
    - **NOTE:** After updating `backend/prisma/schema.prisma` (e.g., adding `lastfm_username` to `Profile`), you must re-run `npx prisma generate` in the `backend` directory.

3.  **Apply Prisma Schema Changes for Vinyl Item Folder:**

    - **Instruction 1:** Navigate to the `backend` directory: `cd backend`
    - **Instruction 2:** Create a new migration for the folder field: `npx prisma migrate dev --name add_vinyl_item_folder` (review the generated SQL).
    - **Instruction 3:** Generate Prisma Client: `npx prisma generate`.
    - **Reason:** Updates the database schema to include the `folder` field for vinyl items and regenerates the Prisma client to reflect these changes. This is crucial for backend linter/type errors to resolve.

4.  **Install NestJS Axios for HTTP Calls (Backend):**
    - **Instruction:** Navigate to the `backend` directory (`cd backend`) and run `npm install @nestjs/axios axios`.
    - **Reason:** Required by the `AnalyticsService` to make HTTP requests to the Last.fm API.

---

## ⏳ Pending / Future Tasks

These tasks are upcoming, require external setup, or are larger development efforts.

### Phase 1.1: Project Setup (Frontend & General)

1.  **Run the Docker Development Environment (Optional):**

    - **Prerequisite:** Docker Desktop/Engine installed.
    - **Instruction:** At project root, run `docker-compose -f docker/docker-compose.yml up --build`.
    - **Reason:** Starts the Next.js app in a Docker container (accessible at `http://localhost:3000`).

2.  **Configure GitHub Repository and Vercel Deployment:**
    - **Instruction 1:** Create a new GitHub repository.
    - **Instruction 2:** `git init`, commit, and push to GitHub.
    - **Instruction 3:** Create/login to Vercel, import GitHub repo.
    - **Instruction 4:** Configure Vercel project (usually auto-detected for Next.js). Deploy.
    - **Reason:** Sets up version control and CI/CD for the frontend.

### Phase 1.3: Discogs Integration (Read-Only)

1.  **Set up Discogs API Credentials & User Agent:**

    - **Instruction 1:** Create a Discogs App (Settings > Developers) for Consumer Key/Secret.
    - **Instruction 2:** Define a User-Agent (e.g., `SonoSphere/0.1 +https://your.app`).
    - **Instruction 3:** Add to `.env.local` (and Vercel):
      ```env
      DISCOGS_CONSUMER_KEY=your_discogs_consumer_key
      DISCOGS_CONSUMER_SECRET=your_discogs_consumer_secret
      DISCOGS_USER_AGENT=YourAppName/Version +YourAppURLOrContact
      ```
    - **Reason:** Required for Discogs API access.

2.  **Implement Full Discogs OAuth 1.0a for User Data (Future Task):**
    - **Instruction:** Plan and implement the OAuth 1.0a flow for Discogs (redirect, callback, token exchange/storage) to enable `getUserDiscogsCollection`.
    - **Reason:** Crucial for personalized collection features. This is a significant development task.

### Phase 1.4: Database & API Foundation (Backend)

1.  **Set up Redis Instance for Caching:**

    - **Instruction 1:** Provision a Redis instance (e.g., Upstash, Render, Aiven).
    - **Instruction 2:** Get the `REDIS_URL` (e.g., `redis://user:password@host:port`).
    - **Instruction 3:** Add this `REDIS_URL` to your `backend/.env` file and to the backend service's environment variables if deploying it (e.g., on Render).
    - **Reason:** Enables caching in the NestJS backend.

2.  **Apply Prisma Schema Changes for Vinyl Item Status:**
    - **Instruction 1:** Navigate to the `backend` directory: `cd backend`
    - **Instruction 2:** Create a new migration for the status field: `npx prisma migrate dev --name add_vinyl_item_status` (review the generated SQL).
    - **Instruction 3:** Generate Prisma Client: `npx prisma generate`.
    - **Reason:** Updates the database schema to include the `status` field for vinyl items and regenerates the Prisma client to reflect these changes.

### Phase 2.1: Single Playback Integration (Spotify)

1.  **Set up Spotify Developer App and Credentials:**

    - **Instruction 1:** Go to the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard/) and create a new application.
    - **Instruction 2:** Note your Client ID and Client Secret.
    - **Instruction 3:** Configure Redirect URIs. For local development, you'll likely need `http://localhost:3000/auth/callback/spotify` (or similar, depending on your auth flow). Add the equivalent for your deployed Vercel URL.
    - **Instruction 4:** Add these credentials to your `.env.local` file (and to Vercel environment variables):
      ```env
      SPOTIFY_CLIENT_ID=your_spotify_client_id
      SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
      NEXT_PUBLIC_SPOTIFY_REDIRECT_URI=http://localhost:3000/auth/callback/spotify
      # For Vercel, you'll also add SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET,
      # and a production NEXT_PUBLIC_SPOTIFY_REDIRECT_URI
      ```
    - **Reason:** Necessary for Spotify OAuth authentication and API access.

2.  **Spotify Web Playback SDK Integration & Dependencies:**

    - **SDK Integration:** The Spotify Web Playback SDK is loaded dynamically via a `<script>` tag in `src/components/providers/SpotifyPlayerProvider.tsx`. It is not installed as a direct npm package.
    - **Type Definitions:** For TypeScript support, `@types/spotify-web-playback-sdk` has been added to `devDependencies` in `package.json`.
    - **Instruction:** Ensure frontend dependencies are installed by running `npm install` (or equivalent) at the project root after any changes to `package.json`.
    - **Reason:** Correctly integrates the SDK as per Spotify's guidelines and provides type safety for development.

3.  **Install Recharts for Analytics Visualizations (Frontend):**

    - **Instruction:** At the project root, run `npm install recharts` (or ensure it's installed via `npm install` if it was added to `package.json`).
    - **Reason:** Required for rendering charts on the analytics page.

4.  **Install Required shadcn/ui Components for Player & UI Features:**
    - **Instruction:** At the project root, run:
      ```bash
      npx shadcn@latest add slider
      npx shadcn@latest add sonner
      npx shadcn@latest add scroll-area
      npx shadcn@latest add sheet
      npx shadcn@latest add dialog
      npx shadcn@latest add alert-dialog
      npx shadcn@latest add textarea
      npx shadcn@latest add select
      # Ensure all components used across forms and pages are added:
      # button, card, input, label, pagination, badge are also commonly used.
      ```
    - **Reason:**
      - `slider`: Used for the volume control in the Spotify player UI.
      - `sonner`: For toast notifications (e.g. player errors, connection status).
      - `scroll-area`: For the queue display.
      - `sheet`: Used to display the playback queue.
      - `dialog`: Used for forms like manual scrobble entry.
      - `alert-dialog`: Used for confirmations (e.g., delete item).
      - `textarea`: Used for multi-line text inputs (e.g., notes in forms).
      - `select`: Used for choosing options (e.g., item status like Owned/Wishlist).

### Phase 2.2: Last.fm Integration & Scrobbling

1.  **Set up Last.fm API Credentials:**
    - **Instruction 1:** Go to the [Last.fm API page](https://www.last.fm/api/account/create) and create an API account (or use an existing one).
    - **Instruction 2:** Note your API Key and Shared Secret.
    - **Instruction 3:** Add these to your `.env.local` file (and to Vercel environment variables):
      ```env
      LASTFM_API_KEY=your_lastfm_api_key
      LASTFM_SHARED_SECRET=your_lastfm_shared_secret
      NEXT_PUBLIC_LASTFM_CALLBACK_URL=http://localhost:3000/auth/callback/lastfm
      # For Vercel, add a production NEXT_PUBLIC_LASTFM_CALLBACK_URL
      ```
    - **Reason:** Necessary for authenticating with the Last.fm API and scrobbling tracks.
    - **Note:** The callback URL will be used when authenticating the user with Last.fm to get a session key.
    - **Ensure `LASTFM_API_KEY` is also available as an environment variable to your NestJS backend if its environment is managed separately from the frontend `.env.local`.**

---

Please ensure you complete the "Assumed Completed Tasks" if you haven't already. The "Pending / Future Tasks" will be addressed as we continue development or are items for you to set up externally.
