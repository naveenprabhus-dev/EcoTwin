# EcoTwin Developer Contribution Guide

Welcome! This guide ensures new improvements are added preserving system stability and code elegance.

## 1. Coding Mandates

- **Strict Types**: Do not declare variables or parameters with `any`. Explicitly type all objects. Declare types early within `/src/types/` as clean modular interfaces.
- **Design System First**: Avoid styling layouts with direct custom colors or duplicating card containers. Use the standard components provided in `/src/shared/ui/`.
- **Pure CSS**: Do not include styled-components or create individual `.css` sheets. All styling must utilize standard Tailwind classes directly.

## 2. Telemetry and Audit Logging

Every key activity handler (e.g., chat answers, day submissions) should be accompanied by telemetry calls:
```typescript
import { Logger } from '../shared/utils/logger';
import { Analytics } from '../shared/utils/analytics';

Logger.info('Saved custom log', 'CONTROLLER');
Analytics.track('habit_logged', userId, { category });
```

## 3. Pull Request Policy
Before submitting, you must ensure that:
1. All files pass the linter: `npm run lint`
2. All 77 unit tests pass cleanly: `npm run test`
3. Standalone code builds successfully: `npm run build`
