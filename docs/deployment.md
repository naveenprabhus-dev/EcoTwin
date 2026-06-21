# EcoTwin Deployment Guide

This guide documents the production build, dependency requirements, and startup parameters for container execution.

## 1. Environment Bounds

- **External Port Constraint**: Port `3000` is the ONLY externally accessible container port. The Express server binds securely to host `0.0.0.0` and port `3000`.
- **HMR Override**: HMR is disabled in production via the `DISABLE_HMR=true` parameter.

## 2. Production Build Lifecycle

Production compiles utilizing a dual-stage bundle setup:
1. **Frontend Assets**: Vite builds static optimized assets inside the `/dist` directory.
2. **Backend Server**: Express is compiled to a standalone CommonJS bundle `/dist/server.cjs` via esbuild.

### Run commands manually:
```bash
# Build frontend & bundle backend CJS
npm run build

# Start stand-alone server
npm run start
```

## 3. Environment Variables (.env.example)

Ensure the following boundaries are defined:
```env
# Gemini API Key (keep server side only!)
GEMINI_API_KEY=your-api-key

# Production environment identifier
NODE_ENV=production
```
Do NOT prefix confidential keys with `VITE_` to prevent them from slipping into client browser packages.
