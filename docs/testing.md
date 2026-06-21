# EcoTwin Testing Guide

EcoTwin enforces strict TDD principles utilizing **Vitest** for fast, reliable unit, integration, and error fallback assertions.

## 1. Test Categories

- **Unit Tests**: Secure mathematical multipliers (`CarbonEngine.test.ts`), ecosystem status state machine calculations (`PlanetPulseEcosystem.test.tsx`), and companionship metrics.
- **Error Fallback Tests**: Assert that when Firestore or Gemini APIs timeout, the UI components fall back immediately to local, cached, or stable analytical defaults without crashing the user's viewport (`errors.test.tsx`).
- **Integration Tests**: Verify state propagation across Firestore authentications and profile initialization pipelines.

## 2. Execution Guide

Run all tests synchronously:
```bash
npx vitest run
```

Run tests in watch mode:
```bash
npx vitest
```

## 3. Mock Configurations

The test suite leverages preloaded static fixtures matching our domain boundaries (e.g. `mockUserChallengeState` and `mockLoggedEntry`). All tests are isolated from external endpoints.
