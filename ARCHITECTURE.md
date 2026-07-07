# Delhi Metro App Architecture & Overview

This document provides a comprehensive overview of the `delhi-metro-app` codebase, detailing its architecture, design system, navigation structure, core functions, and overall tech stack. Agents should read this before modifying the codebase.

## 1. Overview and Tech Stack

The application is a cross-platform mobile app built to provide travel planning, routing, and information for the Delhi Metro (DMRC) and Noida Metro (NMRC). 

**Core Technologies:**
- **Framework:** React Native (v0.81.5) with Expo SDK (v54 - NOTE: refer to Expo v56 docs per AGENTS.md rule)
- **Language:** TypeScript
- **Navigation:** React Navigation v7 (`@react-navigation/native`, `bottom-tabs`, `native-stack`)
- **State Management & Data Fetching:** React Query (`@tanstack/react-query`)
- **UI Component Library:** React Native Paper (`react-native-paper`)
- **Backend / BaaS:** Appwrite (`react-native-appwrite`) for authentication and user data.
- **Local Storage:** AsyncStorage (`@react-native-async-storage/async-storage`) and Expo SQLite (`expo-sqlite`) for local caching and favorites.
- **Crash Reporting & Monitoring:** Sentry (`@sentry/react-native`)

## 2. Architecture & Design Patterns

The codebase is organized in a modular, scalable way within the `src/` directory.

### 2.1 Dependency Injection (DI)
The app uses a custom Dependency Injection container (`src/di/container.ts` and `DIContext.tsx`) to manage the lifecycle of services. The `ApiClient` is instantiated and injected into services like `DmrcService` and `NmrcService`.

### 2.2 API Layer & Networking
- **ApiClient (`src/api/client.ts`):** A custom wrapper around the native `fetch` API. It handles automatic retries with exponential backoff, request timeouts (using `AbortController`), error classification (`ApiError`, `NetworkError`, `AuthenticationError`), and API key header injection.
- **Services (`src/services/`):** Business logic is encapsulated in service classes (e.g., `DmrcService`, `NmrcService`, `MapService`). These services define strictly typed request and response interfaces.

### 2.3 Caching Strategy
- The app implements localized caching using repositories (`popularRoutesRepository.ts`, `stationSearchCacheRepository.ts`).
- For example, `DmrcService.getJourneyPlanWithLocalCache` first attempts to fetch fresh data. If the network fails, it falls back to the locally cached journey plan.

### 2.4 Error Boundary
- Wrapped at the root level in `App.tsx` via `ErrorBoundary` to gracefully handle and log unexpected UI crashes.

## 3. Navigation & Tabs (Routing)

The routing is built heavily on nested stacks and a custom bottom tab navigator.

### 3.1 Bottom Tabs (`RootTabs.tsx`)
A completely custom, floating tab bar utilizing `BlurView` for a frosted glass effect and `Animated` for smooth pill transitions on selection.
1. **Home (`HomeStack`):** Journey planner for DMRC and NMRC.
2. **Map (`MapStack`):** Interactive metro maps.
3. **Alerts (`AlertsStack`):** Real-time passenger notifications and alerts.
4. **Profile (`ProfileScreen`):** User authentication and profile management (Appwrite).
5. **Settings (`SettingsScreen`):** App preferences, theme selection.

### 3.2 Modal & Detail Stacks
The root navigator also includes modal/stack screens that overlay the main tabs:
- **ExploreStack** & **LinesStack**
- **SavedRoutesScreen** & **FavoriteStationsScreen**
- **AdminDashboardScreen**
- **JourneyResultsScreen** & **StationDetailScreen**

## 4. Design System & Aesthetics

The application follows a modern, highly polished aesthetic, often referred to as a "Bento box" design style.

- **Theming:** A custom `ThemeProvider` merges React Native Paper's theme with React Navigation's theme. It seamlessly supports dark and light modes.
- **Bento Design:** UI components utilize `bentoRadius` and `bentoGap` constants to create rounded, card-like interfaces.
- **Semantic Colors:** Specific colors are defined for success, error, warning, and specific metro lines (e.g., `semantic.blue_line`, NMRC Aqua Line colors).
- **Micro-interactions:** The custom tab bar and station pickers include layout animations and spring physics to make the app feel responsive and "alive."

## 5. Core Features & Functions

### 5.1 Route Planning (Home Screen)
The `HomeScreen` is the primary feature area. It allows users to:
- Select departure and arrival stations for both DMRC and NMRC.
- Select a departure time using `@react-native-community/datetimepicker` or quick-select chips (Now, +15m, +30m).
- View saved routes and favorite stations directly from the dashboard.

### 5.2 Offline & Resilience Capabilities
- **Offline Banner:** An `OfflineBanner` component detects network state and alerts the user if they are disconnected.
- **Cached Results:** Using the `AsyncStorage` repositories, users can still view popular routes or their saved paths even without an active internet connection.

### 5.3 Authentication
Handled via `AuthProvider` using Appwrite. The app supports anonymous logins.
