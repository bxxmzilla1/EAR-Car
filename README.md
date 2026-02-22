<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# E.A.R. Car Rental Services

A PWA-ready car rental website for Puerto Princesa, El Nido & Palawan. Browse the fleet, view unit details, and send booking inquiries via WhatsApp, Viber, or Messenger.

## Run Locally

**Prerequisites:** Node.js 18+

1. Install dependencies:
   ```bash
   npm install
   ```
2. Run the dev server:
   ```bash
   npm run dev
   ```
3. Open [http://localhost:3000](http://localhost:3000)

## Build

```bash
npm run build
npm run preview  # Preview production build
```

## Deploy to Vercel

1. Initialize git in this folder (if needed) and push to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
   git push -u origin main
   ```
2. Import the project in [Vercel](https://vercel.com) → New Project → Import Git Repository
3. Deploy — Vercel auto-detects Vite, runs `npm run build`, and serves from `dist/` with SPA routing

## PWA Features

- Installable on mobile and desktop
- Offline support via service worker
- Standalone app experience
