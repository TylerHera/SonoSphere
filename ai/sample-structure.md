SonoSphere/
├── .github/                           # GitHub Actions CI/CD workflows
│   └── workflows/
│       ├── ci.yml
│       └── deploy.yml
├── public/                            # Static assets
│   ├── favicon.ico
│   ├── manifest.json                  # PWA manifest
│   └── assets/
│       ├── icons/
│       └── images/
├── src/
│   ├── app/                           # Next.js App Router
│   │   ├── layout.tsx                 # Root layout
│   │   ├── page.tsx                   # Homepage
│   │   ├── api/                       # API routes
│   │   │   ├── auth/
│   │   │   │   ├── [...nextauth]/     # NextAuth.js routes
│   │   │   │   │   └── route.ts
│   │   │   │   ├── login/
│   │   │   │   │   └── route.ts
│   │   │   │   └── register/
│   │   │   │       └── route.ts
│   │   │   └── trpc/                  # tRPC API routes (optional)
│   │   │       └── [trpc]/
│   │   │           └── route.ts
│   │   ├── collection/                # Collection feature slice
│   │   │   ├── page.tsx               # Collection main page
│   │   │   ├── [id]/                  # Album detail page
│   │   │   │   └── page.tsx
│   │   │   ├── components/            # Collection-specific components
│   │   │   │   ├── CollectionGrid.tsx
│   │   │   │   ├── AlbumCard.tsx
│   │   │   │   ├── CollectionFilters.tsx
│   │   │   │   └── CollectionHeader.tsx
│   │   │   └── actions.ts             # Collection server actions
│   │   ├── price-tracker/             # Price tracking feature slice
│   │   │   ├── page.tsx               # Price tracker main page
│   │   │   ├── watchlist/             # Watchlist page
│   │   │   │   └── page.tsx
│   │   │   ├── alerts/                # Price alerts page
│   │   │   │   └── page.tsx
│   │   │   ├── components/            # Price tracker components
│   │   │   │   ├── PriceChart.tsx
│   │   │   │   ├── PriceAlertForm.tsx
│   │   │   │   └── WatchlistItem.tsx
│   │   │   └── actions.ts             # Price tracker server actions
│   │   ├── calendar/                  # Releases calendar feature slice
│   │   │   ├── page.tsx               # Calendar main page
│   │   │   ├── components/            # Calendar components
│   │   │   │   ├── ReleaseCalendar.tsx
│   │   │   │   ├── ReleaseDayCell.tsx
│   │   │   │   └── ReleaseDetails.tsx
│   │   │   └── actions.ts             # Calendar server actions
│   │   ├── player/                    # Player feature slice
│   │   │   ├── components/            # Player components
│   │   │   │   ├── Player.tsx
│   │   │   │   ├── PlayerControls.tsx
│   │   │   │   ├── NowPlaying.tsx
│   │   │   │   ├── Queue.tsx
│   │   │   │   └── VolumeControl.tsx
│   │   │   └── actions.ts             # Player server actions
│   │   ├── scrobbles/                 # Scrobbles feature slice
│   │   │   ├── page.tsx               # Scrobbles main page
│   │   │   ├── history/               # Scrobble history page
│   │   │   │   └── page.tsx
│   │   │   ├── components/            # Scrobble components
│   │   │   │   ├── ScrobbleList.tsx
│   │   │   │   ├── ScrobbleEdit.tsx
│   │   │   │   └── ScrobbleFilters.tsx
│   │   │   └── actions.ts             # Scrobble server actions
│   │   ├── analytics/                 # Analytics feature slice
│   │   │   ├── page.tsx               # Analytics dashboard page
│   │   │   ├── components/            # Analytics components
│   │   │   │   ├── ListeningChart.tsx
│   │   │   │   ├── ArtistStats.tsx
│   │   │   │   ├── GenreBreakdown.tsx
│   │   │   │   └── TimeframeSelector.tsx
│   │   │   └── actions.ts             # Analytics server actions
│   │   ├── discover/                  # Discovery feature slice
│   │   │   ├── page.tsx               # Discovery main page
│   │   │   ├── recommendations/       # Recommendations page
│   │   │   │   └── page.tsx
│   │   │   ├── blast-from-past/       # Blast from the past page
│   │   │   │   └── page.tsx
│   │   │   ├── components/            # Discovery components
│   │   │   │   ├── RecommendationList.tsx
│   │   │   │   ├── BlastFromPast.tsx
│   │   │   │   └── DiscoveryFilters.tsx
│   │   │   └── actions.ts             # Discovery server actions
│   │   ├── badges/                    # Badges feature slice
│   │   │   ├── page.tsx               # Badges main page
│   │   │   ├── challenges/            # Challenges page
│   │   │   │   └── page.tsx
│   │   │   ├── components/            # Badges components
│   │   │   │   ├── BadgeGrid.tsx
│   │   │   │   ├── ChallengeList.tsx
│   │   │   │   └── AchievementCard.tsx
│   │   │   └── actions.ts             # Badges server actions
│   │   ├── settings/                  # Settings feature slice
│   │   │   ├── page.tsx               # Settings main page
│   │   │   ├── connections/           # Service connections page
│   │   │   │   └── page.tsx
│   │   │   ├── profile/               # Profile settings page
│   │   │   │   └── page.tsx
│   │   │   ├── components/            # Settings components
│   │   │   │   ├── ConnectionCard.tsx
│   │   │   │   ├── ThemeSettings.tsx
│   │   │   │   └── ProfileForm.tsx
│   │   │   └── actions.ts             # Settings server actions
│   ├── components/                    # Shared components
│   │   ├── ui/                        # shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   └── ...
│   │   ├── layout/                    # Layout components
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── MobileNav.tsx
│   │   ├── providers/                 # Context providers
│   │   │   ├── ThemeProvider.tsx
│   │   │   ├── AuthProvider.tsx
│   │   │   └── PlayerProvider.tsx
│   │   └── common/                    # Common components
│   │       ├── LoadingSpinner.tsx
│   │       ├── ErrorBoundary.tsx
│   │       └── EmptyState.tsx
│   ├── lib/                           # Utility libraries and helpers
│   │   ├── api/                       # API clients
│   │   │   ├── discogs.ts
│   │   │   ├── lastfm.ts
│   │   │   ├── spotify.ts
│   │   │   ├── appleMusic.ts
│   │   │   ├── musicbrainz.ts
│   │   │   ├── keepa.ts
│   │   │   └── musixmatch.ts
│   │   ├── db/                        # Database utilities
│   │   │   ├── schema.ts              # Drizzle or Prisma schema
│   │   │   ├── client.ts              # Database client
│   │   │   └── migrations/            # Database migrations
│   │   ├── auth/                      # Authentication utilities
│   │   │   ├── jwt.ts
│   │   │   ├── oauth.ts
│   │   │   └── session.ts
│   │   ├── utils/                     # Utility functions
│   │   │   ├── formatters.ts
│   │   │   ├── dates.ts
│   │   │   └── validation.ts
│   │   └── constants/                 # Application constants
│   │       ├── routes.ts
│   │       ├── apiKeys.ts
│   │       └── endpoints.ts
│   ├── hooks/                         # Custom React hooks
│   │   ├── useCollection.ts
│   │   ├── usePlayer.ts
│   │   ├── useScrobble.ts
│   │   ├── usePriceTracker.ts
│   │   └── useAuth.ts
│   ├── types/                         # TypeScript type definitions
│   │   ├── discogs.ts
│   │   ├── lastfm.ts
│   │   ├── spotify.ts
│   │   ├── collection.ts
│   │   ├── player.ts
│   │   └── api.ts
│   ├── services/                      # Business logic services
│   │   ├── collection.service.ts
│   │   ├── priceTracker.service.ts
│   │   ├── scrobble.service.ts
│   │   ├── player.service.ts
│   │   ├── recommendation.service.ts
│   │   └── badge.service.ts
│   ├── store/                         # Global state management (Zustand)
│   │   ├── playerStore.ts
│   │   ├── collectionStore.ts
│   │   ├── userStore.ts
│   │   └── index.ts
│   └── styles/                        # Global styles
│       ├── globals.css                # Tailwind directives and global styles
│       └── themes.css                 # Theme variables
├── scripts/                           # Utility scripts
│   ├── seed.js                        # Database seeding
│   └── generate-api-types.js          # API type generation
├── docker/                            # Docker configuration
│   ├── Dockerfile.dev
│   ├── Dockerfile.prod
│   └── docker-compose.yml
├── .gitignore
├── .eslintrc.js
├── .prettierrc
├── jest.config.js
├── cypress.config.ts
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
├── package.json
└── README.md

This comprehensive file structure follows the vertical slice pattern, organizing code by feature rather than technical concern. Each feature slice (collection, player, analytics, etc.) includes its own pages, components, and server actions, allowing for independent development and easy maintenance.
The structure supports Next.js 14 App Router with TypeScript, Tailwind CSS, and shadcn/ui components. The architecture facilitates implementing the features described in the PRD according to the phased approach outlined in the plan.md file.
Key elements of this structure:

Feature-based organization with vertical slices
Shared components, hooks, and utilities in central locations
API integration clients in lib/api
Type definitions for third-party services
Business logic separated into services
Global state management with Zustand
Docker configuration for development and production
CI/CD setup with GitHub Actions

This structure provides a solid foundation to begin implementation according to the phased roadmap, allowing you to focus on one feature slice at a time while maintaining a cohesive application architecture.