# 🗄️ Data Models & Flows

<div align="center">
  <img src="https://img.shields.io/badge/Data_Models-Entity_Relationships-9cf?style=for-the-badge" alt="ERD">
</div>
<br>

This document maps out the entity relationships and data flow within the application, particularly highlighting local cache schemas and API responses.

## Entity Relationship Diagram (ERD)

This diagram visualizes how the stations, lines, and journey records relate to each other within our caching and API schema.

```mermaid
erDiagram
    STATION {
        string code PK
        string name
        float latitude
        float longitude
        boolean has_parking
        string status
    }
    
    LINE {
        string line_code PK
        string name
        string color
        string status
    }
    
    JOURNEY_PLAN {
        string id PK
        string from_station_code FK
        string to_station_code FK
        int duration_minutes
        int fare
        int total_interchanges
    }
    
    SAVED_ROUTE {
        string route_id PK
        string from_station_code FK
        string to_station_code FK
        date created_at
    }

    LINE ||--o{ STATION : "contains"
    STATION ||--o{ JOURNEY_PLAN : "is origin for"
    STATION ||--o{ JOURNEY_PLAN : "is destination for"
    STATION ||--o{ SAVED_ROUTE : "origin"
    STATION ||--o{ SAVED_ROUTE : "destination"
```

## Authentication Data Flow

A detailed sequence showing how user authentication is handled via Appwrite, including secure session storage.

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant App as React Native App
    participant AuthContext as AuthProvider
    participant Appwrite as Appwrite Backend
    participant Storage as Secure Storage
    
    User->>App: Enter Phone / Email
    App->>AuthContext: login(credentials)
    AuthContext->>Appwrite: POST /account/sessions
    Appwrite-->>AuthContext: Returns Session Token
    AuthContext->>Storage: Store Session Token securely
    AuthContext->>App: Update User State (isLogged = true)
    App-->>User: Navigate to Dashboard
```

## Theming Data Structure

Our bento-box UI heavily depends on structured theming JSON. Here's a brief JSON schema representation:

<details>
<summary><b>View Theme JSON Structure</b></summary>
<br>

```json
{
  "colors": {
    "primary": "#6750A4",
    "onPrimary": "#FFFFFF",
    "primaryContainer": "#EADDFF",
    "background": "#FFFBFE",
    "surface": "#FFFBFE"
  },
  "metrics": {
    "bentoRadius": {
      "button": 12,
      "card": 24,
      "pill": 999
    },
    "spacing": {
      "sm": 8,
      "md": 16,
      "lg": 24
    }
  }
}
```
</details>

> 💡 **Tip:** To modify the theme globally, update the constants in `src/theme/colors.ts` and `src/theme/spacing.ts`.
