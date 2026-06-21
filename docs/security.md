# EcoTwin Security Model

EcoTwin implements a Zero-Trust security model with strict isolation of user profiles, email verification guards, and structured transaction boundaries.

## 1. Cloud Firestore Rules Architecture

- **The Master Gate Pattern**: Access control to sub-collections is derived strictly from authenticating ownership of the parent resource:
  ```javascript
  match /users/{userId} {
    allow read, write: if isSignedIn() && isOwner(userId);
  }
  ```
- **Email Verification Guard (Standard Writes)**: Email verification is strictly mandated for profile modifications using the `request.auth.token.email_verified == true` assertion.
- **The Shadow Update Defense**: Every update operation validates individual affected fields using:
  ```javascript
  request.resource.data.diff(resource.data).affectedKeys().hasOnly(['status', 'completedAt'])
  ```
  This prevents "ghost injection" attacks trying to modify RBAC roles or credentials.

## 2. API Security Boundaries

- **No Key Leaks**: All Gemini API keys are retrieved and evaluated strictly on the server-side (`server.ts`).
- **PII Isolation**: Complete user addresses, phones, and emails are strictly protected via the split-private collection approach. Client browser APIs cannot perform broad unrestricted listings.
- **Strict Input Validation**: All custom logged activities are validated to reject oversize injection payloads or invalid types.
