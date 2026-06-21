# EcoTwin REST API Reference

This document maps the active full-stack HTTP endpoints, parameter payloads, and return objects.

## 1. Core Endpoints

### GET `/api/health`
Checks backend routing stability.
- **Response**:
  ```json
  { "status": "ok" }
  ```

### GET `/api/profiles`
Fetches or initializes the logged-in user profile with Firestore state caching.
- **Parameters**: `userId` (query string, required), `email` (query string, required)
- **Response**:
  ```json
  {
    "userId": "usr-12abc",
    "email": "user@domain.com",
    "name": "Jane",
    "onboarded": true,
    "stats": { ... },
    "companion": { ... }
  }
  ```

### POST `/api/entries`
Logs a new carbon-offset activity.
- **Payload**:
  ```json
  {
    "userId": "usr-12abc",
    "category": "transport",
    "activity": "Commute by Electric Train",
    "co2": -3.2,
    "xp": 45
  }
  ```
- **Response**: Returns the newly logged activity log block.

### GET `/api/action-planner`
Retrieves or instantiates the 7-day sustainability roadmap.
- **Parameters**: `userId` (query string, required)
- **Response**: 7-Day structured action day groups.
