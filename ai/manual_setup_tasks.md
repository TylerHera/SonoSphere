## Phase 1.1: Project Setup

1.  **Install Node.js dependencies:**
    *   **Instruction:** Open your terminal at the root of the project and run `npm install` (or `yarn install` / `pnpm install` depending on your preferred package manager).
    *   **Reason:** This will download and install all the project dependencies defined in `package.json`, such as Next.js, React, TypeScript, and ESLint, into a `node_modules` directory and create a lock file (e.g., `package-lock.json`). This step is crucial for the project to be buildable and runnable.

2.  **Set up Husky pre-commit hooks:**
    *   **Instruction 1:** Ensure all dependencies are installed by running `npm install` (or equivalent) if you haven't already.
    *   **Instruction 2:** Make the pre-commit hook executable. In your terminal, run: `chmod +x .husky/pre-commit`
    *   **Instruction 3 (Optional):** Run `npm run prepare` to initialize Husky if it hasn't run automatically post-install.
    *   **Reason:** Husky allows you to run scripts (like linters and formatters) automatically before commits, ensuring code quality and consistency.

3.  **Run the Docker development environment (Optional):**
    *   **Prerequisite:** Docker Desktop (or Docker Engine and Compose CLI) must be installed and running.
    *   **Instruction:** Open your terminal at the root of the project and run `docker-compose -f docker/docker-compose.yml up --build`.
    *   **Reason:** This will build the Docker image for the development environment (if not already built) and start the Next.js application container. The app should then be accessible at `http://localhost:3000`.

4.  **Configure GitHub Repository and Vercel Deployment:**
    *   **Instruction 1:** Create a new repository on GitHub.
    *   **Instruction 2:** Initialize a git repository locally in your project root (`git init`), commit your files (`git add .`, `git commit -m "Initial project setup"`), and push your local repository to the GitHub repository you created.
    *   **Instruction 3:** Sign up for a Vercel account (vercel.com) if you don't have one.
    *   **Instruction 4:** On Vercel, create a new project. Choose to import from your GitHub repository and select the `SonoSphere` repository.
    *   **Instruction 5:** Configure the Vercel project settings. Vercel usually auto-detects Next.js projects and sets up build and output settings correctly. Deploy the main branch.
    *   **Reason:** This sets up version control for your project and configures automatic deployments of your frontend to Vercel whenever you push changes to the connected branches.

5.  **Add Supabase Dependency Manually (if previous attempt failed):**
    *   **Instruction:** Open `package.json` and ensure the following line is present in the `"dependencies"` section: `"@supabase/supabase-js": "^2.43.4"` (use the latest version if preferred).
    *   **Reason:** This package is required to interact with Supabase for authentication and database operations. Then run `npm install` (or equivalent) again.

6.  **Set up Supabase Environment Variables:**
    *   **Instruction 1:** Create a new project on [Supabase](https://supabase.com) if you haven't already.
    *   **Instruction 2:** In your Supabase project dashboard, navigate to Project Settings > API.
    *   **Instruction 3:** Find your Project URL and the `anon` `public` key.
    *   **Instruction 4:** Create a file named `.env.local` in the root of your Next.js project (if it doesn't exist). Add the following lines, replacing the placeholders with your actual Supabase credentials:
        ```env
        NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
        NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
        ```
    *   **Instruction 5:** Add these same environment variables to your Vercel project settings for deployment.
    *   **Reason:** These variables are required by the Supabase client libraries to connect to your Supabase backend for authentication and database services. The `.env.local` file is for local development and should be in your `.gitignore` (which it is by default in Next.js).

7.  **Add shadcn/ui Components for Auth Pages:**
    *   **Instruction:** Open your terminal at the root of the project and run the following commands to add the necessary UI components for the login and signup pages:
        ```bash
        npx shadcn-ui@latest add button
        npx shadcn-ui@latest add card
        npx shadcn-ui@latest add input
        npx shadcn-ui@latest add label
        ```
    *   **Reason:** These commands will add the respective component files to your `src/components/ui` directory, which are used by the login and signup pages. Ensure you have run `npm install` (or equivalent) and initialized shadcn/ui (as covered in previous setup steps) before running these.

8.  **Set up Discogs API Credentials and User Agent:**
    *   **Instruction 1:** Go to the [Discogs Developer Settings](https://www.discogs.com/settings/developers) and create a new application. This will provide you with a Consumer Key and Consumer Secret.
    *   **Instruction 2:** Define a User-Agent string for your application. This should be in the format `YourAppName/YourAppVersion +http://your-app-website-or-contact-info.com`. For example: `SonoSphere/0.1 +https://sonosphere.app` (replace with your actual app name and URL if available).
    *   **Instruction 3:** Add these to your `.env.local` file (and to Vercel environment variables later):
        ```env
        DISCOGS_CONSUMER_KEY=your_discogs_consumer_key
        DISCOGS_CONSUMER_SECRET=your_discogs_consumer_secret
        DISCOGS_USER_AGENT=YourAppName/Version +YourAppURLOrContact
        ```
    *   **Reason:** The User-Agent is required for all Discogs API requests. The Consumer Key and Secret are needed for OAuth authentication (to access user-specific data like collections) and can provide higher rate limits for authenticated requests, though not strictly necessary for all public data endpoints initially.

9.  **Implement Full Discogs OAuth 1.0a for User Data (Future Task):**
    *   **Instruction:** Plan and implement the complete OAuth 1.0a authentication flow for Discogs. This involves:
        1.  Redirecting the user to Discogs for authorization.
        2.  Handling the callback from Discogs with request tokens.
        3.  Exchanging request tokens for access tokens.
        4.  Securely storing and refreshing these user-specific access tokens (e.g., associated with the Supabase user).
        5.  Modifying the `getUserDiscogsCollection` function in `src/lib/api/discogs.ts` to use these tokens to fetch user collection data.
    *   **Reason:** Discogs uses OAuth 1.0a (not OAuth 2.0) for user-specific data access (like their collection/wantlist). This is a more complex flow than typical OAuth2 and is crucial for personalized collection features. The current `getUserDiscogsCollection` is a placeholder.
    *   **Note:** This is a significant development task that builds upon the initial placeholder OAuth setup (Task 1.2.3) and the Discogs API client (Task 1.3.1).

10. **Add shadcn/ui Pagination Component:**
    *   **Instruction:** Open your terminal at the root of the project and run the following command:
        ```bash
        npx shadcn-ui@latest add pagination
        ```
    *   **Reason:** The collection search page uses the `Pagination` component from shadcn/ui to navigate through search results. This command adds the necessary component files to `src/components/ui`.

11. **Add shadcn/ui Badge Component:**
    *   **Instruction:** Open your terminal at the root of the project and run the following command:
        ```bash
        npx shadcn-ui@latest add badge
        ```
    *   **Reason:** The release detail page uses the `Badge` component from shadcn/ui to display genres and styles. This command adds the necessary component files to `src/components/ui`.

12. **Set up Initial Supabase Database Schema:**
    *   **Instruction:** 
        1.  Navigate to your Supabase project dashboard.
        2.  Go to the "SQL Editor" section.
        3.  Click "New query" (or run in an existing one).
        4.  Copy and paste the SQL provided below into the editor and run it. This SQL creates `profiles` and `vinyl_items` tables with appropriate Row Level Security (RLS) policies and a trigger to auto-create profiles.
    *   **SQL to Run:**
        ```sql
        -- Create a table for public user profiles
        CREATE TABLE public.profiles (
          id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
          username TEXT UNIQUE,
          avatar_url TEXT,
          updated_at TIMESTAMPTZ DEFAULT NOW(),
          CONSTRAINT username_length CHECK (char_length(username) >= 3)
        );

        -- Optional: Function and Trigger to auto-create profile on new user signup
        CREATE OR REPLACE FUNCTION public.handle_new_user()
        RETURNS TRIGGER AS $$
        BEGIN
          INSERT INTO public.profiles (id, username)
          VALUES (new.id, new.raw_user_meta_data->>'username'); -- Assumes username might be in metadata during signup
          RETURN new;
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER;

        CREATE TRIGGER on_auth_user_created
          AFTER INSERT ON auth.users
          FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

        -- Enable RLS for the profiles table
        ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

        -- Policies for profiles:
        CREATE POLICY "Users can insert their own profile" ON public.profiles
          FOR INSERT WITH CHECK (auth.uid() = id);
        CREATE POLICY "Users can update their own profile" ON public.profiles
          FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
        CREATE POLICY "Users can view their own profile" ON public.profiles
          FOR SELECT USING (auth.uid() = id);

        -- Create table for vinyl items
        CREATE TABLE public.vinyl_items (
          id BIGSERIAL PRIMARY KEY,
          user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
          discogs_id INT UNIQUE,
          title TEXT NOT NULL,
          artist_main TEXT NOT NULL,
          artists_extra JSONB,
          release_title TEXT,
          year INT,
          formats JSONB,
          labels JSONB,
          genres TEXT[],
          styles TEXT[],
          cover_url_small TEXT,
          cover_url_large TEXT,
          status TEXT DEFAULT 'owned' NOT NULL,
          added_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
          updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
          notes TEXT,
          custom_tags TEXT[]
        );

        -- Enable RLS for vinyl_items table
        ALTER TABLE public.vinyl_items ENABLE ROW LEVEL SECURITY;

        -- Policies for vinyl_items:
        CREATE POLICY "Users can insert their own vinyl items" ON public.vinyl_items
          FOR INSERT WITH CHECK (auth.uid() = user_id);
        CREATE POLICY "Users can view their own vinyl items" ON public.vinyl_items
          FOR SELECT USING (auth.uid() = user_id);
        CREATE POLICY "Users can update their own vinyl items" ON public.vinyl_items
          FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
        CREATE POLICY "Users can delete their own vinyl items" ON public.vinyl_items
          FOR DELETE USING (auth.uid() = user_id);

        -- Optional: Trigger to update 'updated_at' timestamp
        CREATE OR REPLACE FUNCTION public.update_modified_column()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.updated_at = NOW();
            RETURN NEW;
        END;
        $$ language 'plpgsql';

        CREATE TRIGGER update_vinyl_items_modtime
            BEFORE UPDATE ON public.vinyl_items
            FOR EACH ROW
            EXECUTE FUNCTION public.update_modified_column();

        CREATE TRIGGER update_profiles_modtime
            BEFORE UPDATE ON public.profiles
            FOR EACH ROW
            EXECUTE FUNCTION public.update_modified_column();
        ```
    *   **Reason:** This sets up the foundational database tables in your Supabase PostgreSQL instance required for user profiles and managing vinyl collections, including security policies to protect user data.

13. **Set up Redis Instance for Caching:**
    *   **Instruction 1:** Provision a Redis instance. You can use services like [Render](https://render.com/docs/redis), [Upstash](https://upstash.com/), or other cloud Redis providers.
    *   **Instruction 2:** Obtain the connection URL for your Redis instance (e.g., `redis://user:password@host:port`).
    *   **Instruction 3:** When setting up the NestJS backend, you will add this URL as `REDIS_URL` in its environment configuration (e.g., `backend/.env` and in the Render service environment variables for the backend).
    *   **Reason:** Redis will be used by the NestJS backend for caching API responses (like from Discogs) and potentially other data to improve performance and reduce external API calls.

### Phase 1.4: Database & API Foundation

*   **SQL Schema for Supabase:**
    *   Run the provided SQL scripts in your Supabase project's SQL editor to create `profiles` and `vinyl_items` tables, along with RLS policies and triggers.
*   **Redis Setup:**
    *   Set up a Redis instance (e.g., via Upstash, Aiven, or a local Docker container).
    *   Note the `REDIS_URL` for backend configuration.
*   **NestJS Backend Setup:**
    *   Navigate to the `backend` directory: `cd backend`
    *   Install dependencies: `npm install`
    *   Generate Prisma Client: `npx prisma generate` (ensure your `backend/prisma/schema.prisma` is correctly configured with the `DATABASE_URL` environment variable in mind).
    *   Create a `.env` file in the `backend` directory by copying `backend/.env.example` (see content below if the file creation was blocked) and populate it with your actual `DATABASE_URL` (pointing to Supabase), `REDIS_URL`, and desired `PORT`.
        *   **Updated Content for `backend/.env.example` (and thus for your `backend/.env`):**
            ```env
            DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public&sslmode=require"
            REDIS_URL="redis://HOST:PORT"
            
            PORT=3001
            
            # Supabase settings for JWT validation
            # SUPABASE_URL is your project's URL (e.g., https://your-project-ref.supabase.co)
            # This is the same as NEXT_PUBLIC_SUPABASE_URL from the frontend .env.local
            SUPABASE_URL="https://your-project-ref.supabase.co"
            
            # For RS256 token validation (default & recommended for Supabase JWTs from client libraries):
            # The JwksUri will be derived in code as `SUPABASE_URL/auth/v1/.well-known/jwks.json`
            # The JWT Audience, typically 'authenticated' for Supabase access tokens.
            SUPABASE_JWT_AUDIENCE="authenticated"
            # The JWT Issuer, typically `SUPABASE_URL/auth/v1`. Can be derived or set explicitly if different.
            # SUPABASE_JWT_ISSUER="" # If empty or not set, will attempt to derive from SUPABASE_URL

            # (Optional) If you were to use HS256 validation with a symmetric secret:
            # SUPABASE_JWT_SECRET="your-long-supabase-jwt-secret-from-dashboard-if-using-hs256"
            ```
            *Note: For Supabase, your `DATABASE_URL` can be found in Project Settings > Database. Ensure you use the connection string that requires SSL. Your `SUPABASE_URL` is also in Project Settings > API.* 
