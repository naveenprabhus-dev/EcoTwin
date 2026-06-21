# EcoTwin System Architecture

EcoTwin is designed as a production-grade, highly resilient Full-Stack environmental companion application. This documentation describes the operational layers, state transitions, and dependency flows.

## 1. Structural Overview

The application utilizes a modular, feature-informed architecture structured as follows:

```
src/
├── domain/                    # Clean core models (Domain Entities)
│   ├── User.ts                # Validation, structural integrity of profiles
│   ├── CarbonProfile.ts       # Mathematical emission summing & tree equivalents
│   ├── SustainabilityPlan.ts  # 7-day habits, progress metrics, annual savings projections
│   ├── PlanetState.ts         # Eco-score threshold states & scaling modifiers
│   └── EcoBuddyMemory.ts      # Structured conversational histories
│
├── services/                  # Business & computation logic providers
│   ├── CarbonEngine.ts        # Emissions computation and equivalency scalars
│   ├── EcoBuddyAssistant.ts   # Companion suggestion generators
│   ├── ReportGenerator.ts     # Historical compilations & analytical grades
│   ├── PlanetPulseEcosystem.ts# Streak, live status, and connectivity checks
│   └── OfflineStorage.ts      # Offline action queues & caching boundaries
│
├── shared/
│   ├── ui/                    # Standardized high-contrast design system
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   ├── Badge.tsx
│   │   ├── LoadingState.tsx
│   │   └── ErrorState.tsx
│   └── utils/                 # Unified telemetry logging & diagnostics
│       ├── logger.ts          # Structured level logs with ISO stamps
│       ├── analytics.ts       # Tracked business metrics
│       └── errorTracker.ts    # Centralized exception monitoring
```

## 2. Core Operational Flow

1. **Authentication & Ingestion**:
   - Secure authentication is validated using FireStore Rules and Firebase Authentication.
   - Profile documents are initialized via the `/api/profiles` endpoint, utilizing local caching and Firestore sync.
   
2. **The Carbon Companion Simulation Loop**:
   - User inputs activities (e.g. public transport, plant-based diets).
   - `CarbonEngine` computes exact emission offsets and logs them to the analytical collection.
   - The virtual planet's biosphere state and `PlanetPulseEcosystem` dynamically scale the Visual Pet size based on streaks.

3. **Offline Mitigation**:
   - Transactions are locally queued using `OfflineStorage` if `navigator.onLine` is false.
   - Cached reports are fetched immediately from localStorage during network interruptions.
