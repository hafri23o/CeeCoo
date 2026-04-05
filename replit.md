# NeonStream - Music Streaming App

## Overview
NeonStream is a music streaming web application with a cyberpunk/neon aesthetic. It features genre browsing, album/artist pages, playlists, a music player, search, and user authentication (via Firebase). Built as a frontend-only React application imported from Lovable.

## Recent Changes
- 2026-03-11: Star field background implementation
  - Added StarField component with 400 randomly distributed stars
  - Stars have subtle twinkling animation (sine wave)
  - Canvas-based rendering for optimal performance
  - Integrated into MainLayout for global appearance on all pages
  - Fixed CSS @import ordering (before @tailwind directives)
  - Proper z-index layering: stars (z-0), content (z-10), navigation (z-20), player (z-40/50)
- 2026-02-13: Imported from Lovable to Replit environment
  - Updated Vite config: port 5000, allowedHosts: true, removed lovable-tagger
  - Configured static deployment (dist directory)

## Project Architecture
- **Framework**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + shadcn/ui components
- **Routing**: react-router-dom v6
- **State Management**: React Context (Auth, Player, Theme, Library)
- **Data**: Firebase + mock data in `src/data/mockData.ts`
- **Animation**: Framer Motion

### Directory Structure
```
src/
  components/
    auth/          - Authentication modals
    background/    - StarField (canvas-based star field)
    layout/        - MainLayout, SidebarNav, BottomNav
    library/       - AlbumCard, ArtistCard, GenreCard, SongRow
    player/        - FullScreenPlayer, MiniPlayer
    ui/            - shadcn/ui components
  context/         - AuthContext, PlayerContext, ThemeContext, LibraryContext
  data/            - mockData.ts, types.ts
  hooks/           - use-mobile, use-toast
  lib/             - firebase.ts, utils.ts
  pages/           - All page components
```

### Key Pages
- HomePage, SearchPage, LibraryPage
- ArtistPage, AlbumPage, GenrePage, PlaylistPage
- SignInPage, SignUpPage, SubscribePage, DonatePage
- SettingsPage, AboutPage

## User Preferences
- (none recorded yet)
