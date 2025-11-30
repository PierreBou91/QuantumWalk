# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Quantum Walk is an educational thought experiment website that generates a deterministic sequence of timestamps using SHA-256 hashing. The core concept: starting from Unix Epoch (0), hash each timestamp to generate the next time interval (0-7 days), creating an infinite, reproducible sequence identical everywhere.

This is inspired by the Many Worlds interpretation of quantum mechanics - if an external signal matched a subsequence of our intervals, it might suggest a shared deterministic origin from a parallel branch.

## Development Commands

```bash
# Development
npm run dev              # Start dev server at localhost:4321
npm run dev:mobile       # Expose on local network (requires HTTPS for mobile)

# Production
npm run build            # Build to ./dist/
npm run preview          # Preview production build locally
npm run preview:mobile   # Preview on local network
```

## Critical Technical Constraints

### Web Crypto API Requirement

**IMPORTANT**: This app uses `crypto.subtle` for SHA-256 hashing, which REQUIRES a secure context (HTTPS or localhost).

- Desktop development works fine on `localhost:4321`
- Mobile testing over local network (e.g., `http://192.168.x.x:4321`) will FAIL
- For mobile testing: use ngrok (`npx ngrok http 4321`) or deploy to HTTPS

All hashing code in `src/utils/quantum/hasher.ts` includes error handling for missing `crypto.subtle`.

### Determinism is Sacred

The entire premise depends on the quantum sequence being identical across all platforms and executions:

- **NEVER** change the hash algorithm (SHA-256)
- **NEVER** modify `MAX_INTERVAL_MS` (7 days = 604,800,000 ms)
- **NEVER** use `Math.random()` or any non-deterministic functions in quantum calculations
- **ALWAYS** use BigInt arithmetic in `hashToDuration()` to avoid floating-point precision issues
- **ALWAYS** start from Unix Epoch (0) as the initial step

Any changes to core algorithm parameters will break the entire concept.

## Architecture

### Core Algorithm Flow

1. **Hashing** (`src/utils/quantum/hasher.ts`): Timestamp → SHA-256 hash (64 hex chars)
2. **Duration Conversion** (`src/utils/quantum/durationConverter.ts`): Hash → Duration (0-7 days)
3. **Step Calculation** (`src/utils/quantum/stepCalculator.ts`): Previous step + duration → Next step

The algorithm is stateless - any step can be calculated from its predecessor without knowledge of earlier steps.

### Key Data Flow

```
QuantumStep (index, timestamp, interval, hash, isoString)
    ↓
hashTimestamp(timestamp) → SHA-256 hash
    ↓
hashToDuration(hash) → interval in milliseconds
    ↓
timestamp + interval → next timestamp
    ↓
Next QuantumStep
```

### Sequence Matching Architecture

The matcher (`src/utils/matching/`) compares user-provided timestamp/interval sequences against the Quantum Walk:

1. **Parse Input** (`sequenceMatcher.ts`): Convert user timestamps/intervals to normalized format
2. **Sliding Window Search**: Compare user sequence against quantum steps using all possible alignments
3. **Hybrid Similarity Scoring** (`similarityScore.ts`):
   - Ratio-based similarity (50%)
   - Normalized absolute error (30%)
   - Pearson correlation (20%)
4. **Best Match**: Return highest-scoring alignment with statistics

### Component Organization

- **Pages** (`src/pages/`): Astro file-based routing
  - `index.astro`: Live countdown + step generator
  - `explorer.astro`: Navigate by step index
  - `matcher.astro`: Sequence matching tool
  - `about.astro`, `theory.astro`: Educational content

- **Components** (`src/components/`):
  - `quantum/`: Quantum step display and generation
  - `matching/`: Sequence matching UI
  - `layout/`: Navigation, header, footer
  - `ui/`: Reusable UI elements

### Caching Strategy

The app uses client-side caching (`src/utils/quantum/cache.ts`) for performance:
- Memoizes previously calculated steps
- Prevents redundant hash calculations
- Cache is browser-session scoped (in-memory only)

## Styling Guidelines

### Cosmic Theme

Tailwind is configured with a custom cosmic color palette (see `tailwind.config.mjs`):

```javascript
'cosmic-black': '#0a0a0f'
'cosmic-purple': '#8b5cf6'
'cosmic-blue': '#60a5fa'
'star-white': '#f8fafc'
'nebula-purple': '#a78bfa'
'deep-space': '#030712'
```

Custom animations: `pulse-glow`, `float`, `nebula-rotate`, `twinkle`

### Design Philosophy

- Space-themed UI with starfield background
- Purple/blue gradient color scheme
- Glowing effects on interactive elements
- Clean, modern typography (Inter + JetBrains Mono)

## Type Definitions

All types are in `src/types/`:

- `quantum.ts`: `QuantumStep`, `QuantumConfig`, `StepRange`, `StepCacheEntry`
- `matching.ts`: `MatchResult`, `SequenceAlignment`, `UserSequenceInput`

Use these types consistently. Never use `any` for quantum-related data.

## Code Review Criteria

When reviewing PRs:

1. **Determinism Check**: Ensure no randomness introduced in quantum calculations
2. **Precision Check**: Verify BigInt used for hash-to-duration conversions
3. **Security Context**: Confirm `crypto.subtle` usage includes proper error handling
4. **Type Safety**: All quantum operations must be fully typed
5. **Performance**: Large step calculations should use caching
6. **UI Consistency**: Follow cosmic theme color palette and animations

## Deployment

Site deploys to Netlify automatically on push to main:
- Build command: `npm run build`
- Publish directory: `dist`
- Node version: 20
- Configuration: `netlify.toml`

Security headers and caching rules are configured in `netlify.toml`.

## Export Functionality

Both JSON and CSV export are supported (`src/utils/export/`):
- Steps can be exported individually or in bulk
- Match results include full alignment data
- CSV format includes headers for spreadsheet compatibility
