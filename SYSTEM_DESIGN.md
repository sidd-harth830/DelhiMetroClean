# 🏗️ System Architecture & Design

<div align="center">
  <img src="https://img.shields.io/badge/Architecture-C4_Model-blue?style=for-the-badge" alt="C4 Model">
  <img src="https://img.shields.io/badge/System-Mobile_First-success?style=for-the-badge" alt="Mobile First">
</div>
<br>

This document outlines the deeper system design for the Delhi Metro Clean application using rich diagrams.

## C4 Context Diagram

The context diagram shows how the app interacts with external entities and users.

```mermaid
graph TD
    User(["Delhi/Noida Commuter"]) -->|Plans Journey, Checks Fares| App["Delhi Metro App"]
    
    App -->|Fetches Routing & Station Data| Backend[("Appwrite Backend / DMRC APIs")]
    App -->|Stores Offline Data| LocalDb[("Local SQLite / AsyncStorage")]
    App -->|Reports Crashes & Logs| Sentry["Sentry SDK"]
    
    classDef person fill:#08427b,stroke:#052e56,stroke-width:2px,color:#fff;
    classDef system fill:#1168bd,stroke:#0b4884,stroke-width:2px,color:#fff;
    classDef external fill:#999999,stroke:#6b6b6b,stroke-width:2px,color:#fff;
    
    class User person;
    class App system;
    class Backend external;
    class LocalDb external;
    class Sentry external;
```

## Application Component Diagram

A look inside the React Native application boundaries.

```mermaid
graph LR
    subgraph UI ["UI Components & Navigation"]
        Nav["React Navigation Tabs"]
        Screens["Screens: Home, Map, Profile"]
        Nav --> Screens
    end
    
    subgraph State ["State & Caching"]
        RQ["React Query"]
    end
    
    subgraph Services ["Service Layer"]
        DmrcSvc["DmrcService"]
        NmrcSvc["NmrcService"]
        AuthSvc["AuthService"]
    end
    
    subgraph Core ["Core & Persistence"]
        API["ApiClient Wrapper"]
        Async["AsyncStorage"]
        SQLite["Expo SQLite"]
    end

    Screens --> RQ
    RQ --> DmrcSvc
    RQ --> NmrcSvc
    Screens --> AuthSvc
    
    DmrcSvc --> API
    NmrcSvc --> API
    AuthSvc --> API
    
    DmrcSvc --> Async
    NmrcSvc --> SQLite
```

> **Note on Service injection**: All services are instantiated and managed via our custom Dependency Injection (DI) provider at the root level, making them highly testable.

## Error Handling & Resiliency Flow

```mermaid
stateDiagram-v2
    [*] --> RequestInitiated
    RequestInitiated --> NetworkCheck
    NetworkCheck --> ApiCall : Online
    NetworkCheck --> ServeFromCache : Offline
    
    ApiCall --> Success : 200 OK
    ApiCall --> RetryLogic : 5xx / 429
    ApiCall --> ThrowAuthError : 401 / 403
    
    RetryLogic --> ApiCall : Wait exponential delay
    RetryLogic --> ThrowNetworkError : Max retries hit
    
    Success --> SaveToCache
    SaveToCache --> [*]
    ServeFromCache --> [*]
    ThrowAuthError --> [*]
    ThrowNetworkError --> [*]
```
