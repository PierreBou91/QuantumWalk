# Quantum Walk

A thought experiment website exploring deterministic time-step sequences inspired by the Many Worlds interpretation of quantum mechanics.

## What is Quantum Walk?

The Quantum Walk is a deterministic algorithm that generates an irregular but fully reproducible sequence of timestamps:

1. Start at Unix Epoch (0) - January 1, 1970, 00:00:00 UTC
2. Hash the current timestamp using SHA-256
3. Convert the hash to a duration between 0 and 7 days
4. Add the duration to get the next timestamp
5. Repeat infinitely

Because the algorithm uses cryptographic hashing (SHA-256) and runs entirely client-side, the sequence is identical everywhere.

## The Thought Experiment

Inspired by the Many Worlds interpretation, this experiment asks: *If we detected an external signal with a matching subsequence of intervals, and we could confirm it wasn't generated locally, might it suggest an origin from a parallel branch sharing the same deterministic root?*

**Disclaimer:** This is purely speculative—not scientific proof. It's a conceptual illustration and programming exercise.

## Features

- **Quantum Step Generator**: Real-time countdown to the next quantum step with live updates, showing 10 previous and upcoming steps
- **Step Explorer**: Navigate through the quantum sequence by step index with clickable context browsing
- **Sequence Matcher**: Compare your own sequences of timestamps or intervals against the Quantum Walk
- **Educational Content**: Learn about the algorithms, Many Worlds interpretation, and the thought experiment
- **Export Functionality**: Export steps and match results as JSON or CSV
- **Cosmic UI**: Beautiful space-themed interface with enhanced starfield background and nebula effects

## Tech Stack

- **Framework**: [Astro](https://astro.build) - Static site generation
- **Styling**: [Tailwind CSS](https://tailwindcss.com) - Utility-first CSS with cosmic theme
- **Language**: TypeScript - Type-safe JavaScript
- **Visualization**: [D3.js](https://d3js.org) - Interactive data visualizations (ready for integration)
- **Deployment**: [Netlify](https://netlify.com) - Static hosting with CDN

## Project Structure

```
/
├── public/
│   ├── favicon.svg          # Cosmic-themed favicon
│   └── images/              # Static images
├── src/
│   ├── components/
│   │   ├── quantum/         # Quantum step components
│   │   ├── matching/        # Sequence matching UI
│   │   ├── layout/          # Layout components
│   │   ├── ui/              # Reusable UI components
│   │   └── info/            # Informational components
│   ├── layouts/
│   │   └── MainLayout.astro # Base page layout
│   ├── pages/
│   │   ├── index.astro      # Homepage with step generator
│   │   ├── matcher.astro    # Sequence matching tool
│   │   ├── about.astro      # About page
│   │   └── theory.astro     # Many Worlds theory
│   ├── utils/
│   │   ├── quantum/         # Core algorithms
│   │   ├── matching/        # Matching algorithms
│   │   ├── export/          # JSON/CSV exporters
│   │   ├── visualization/   # D3 chart builders
│   │   └── time/            # Date utilities
│   ├── types/
│   │   ├── quantum.ts       # Quantum step types
│   │   └── matching.ts      # Matching result types
│   └── styles/
│       └── global.css       # Global styles and cosmic theme
├── astro.config.mjs         # Astro configuration
├── tailwind.config.mjs      # Tailwind configuration
├── netlify.toml             # Netlify deployment config
└── package.json
```

## Getting Started

### Prerequisites

- Node.js 20 or higher
- npm

### Installation

```bash
# Install dependencies
npm install
```

### Development

```bash
# Start dev server at localhost:4321
npm run dev

# Or expose on local network for mobile testing (requires HTTPS, see below)
npm run dev:mobile
```

#### Testing on Mobile Devices

**Important**: This app uses the Web Crypto API (`crypto.subtle`) for SHA-256 hashing, which requires a **secure context (HTTPS or localhost)**.

While `localhost` works on desktop, accessing the dev server from a mobile device over your local network (e.g., `http://192.168.x.x:4321`) is NOT a secure context and will cause errors.

**Solutions for mobile testing:**

1. **Use a tunneling service (Recommended for quick testing)**:
   ```bash
   # Install ngrok or cloudflared
   npm run dev

   # In another terminal, create an HTTPS tunnel
   npx ngrok http 4321
   # Access the HTTPS URL provided by ngrok on your mobile device
   ```

2. **Use the production build**:
   ```bash
   npm run build
   npm run preview:mobile

   # Then deploy to GitHub Pages or Netlify and access via HTTPS
   ```

3. **Self-signed certificate** (Advanced):
   - Generate a self-signed SSL certificate
   - Configure Astro to use HTTPS in development
   - Accept the certificate warning on your mobile device

### Build

```bash
# Build production site to ./dist/
npm run build
```

### Preview

```bash
# Preview production build locally
npm run preview
```

## Core Algorithms

### Hash Function (SHA-256)

Uses the Web Crypto API for deterministic, cross-platform hashing:

```typescript
export async function hashTimestamp(timestamp: number): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(timestamp.toString());
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
```

### Hash-to-Duration Conversion

Uses BigInt arithmetic to ensure precision:

```typescript
export function hashToDuration(hash: string): number {
  const hexSubstring = hash.substring(0, 16);
  const hashValue = BigInt('0x' + hexSubstring);
  const maxUint64 = BigInt('0xFFFFFFFFFFFFFFFF');
  const maxInterval = 7 * 24 * 60 * 60 * 1000; // 7 days
  return Number((hashValue * BigInt(maxInterval)) / maxUint64);
}
```

### Sequence Matching

Hybrid similarity scoring combining:
- Ratio-based similarity (50%)
- Normalized absolute error (30%)
- Pearson correlation (20%)

## Deployment

### Netlify

1. Push to GitHub
2. Connect repository to Netlify
3. Netlify will automatically build and deploy
4. Configuration is in `netlify.toml`

The site is optimized for Netlify with automatic builds and CDN distribution.

## Inspiration

- [Veritasium - Many Worlds Video](https://www.youtube.com/watch?v=kTXTPe3wahc)
- [*Something Deeply Hidden*](https://www.preposterousuniverse.com/somethingdeeplyhidden/) by Sean M. Carroll

## License

This is an educational thought experiment project.

## Contributing

This is a personal project, but suggestions and discussions are welcome!
