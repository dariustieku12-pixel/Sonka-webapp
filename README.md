# Sonka-webapp

SONKA customer web app — a browser version of the SONKA mobile app.
People can find cargo drivers near them, view profiles, book trips, and
track deliveries from any phone or laptop, no install required.

## Stack

- **Vite + React + TypeScript** — builds to plain static files
- **React Router** (HashRouter) — works on GitHub Pages with no server config
- **Leaflet + OpenStreetMap** — free maps, no API key
- Talks to the same backend as the mobile app:
  `https://sonka-backend-production.up.railway.app/api`

## What it does

| Screen        | Feature                                                        |
| ------------- | -------------------------------------------------------------- |
| Welcome       | Brand intro, sign up / log in                                  |
| Login/Signup  | Phone-based auth (Phase 1 — no OTP), same as the mobile app    |
| Map           | Live search of nearby drivers, vehicle filter, OSM map         |
| Driver        | Profile, vehicle, rating, reviews                              |
| Book          | Pickup/delivery location search, goods, agreed price           |
| My Trips      | Active and past bookings                                       |
| Trip detail   | Status timeline, live driver tracking, confirm + rate          |
| Profile       | Edit details, referral code, log out, delete account          |

Driver-side features (going online, accepting jobs, the social feed,
chat) stay in the mobile app for now — this is the customer journey.

## Develop

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # outputs to dist/
```

## Deploy

Pushing to `main` triggers `.github/workflows/deploy.yml`, which builds
and publishes to GitHub Pages:

**https://dariustieku12-pixel.github.io/Sonka-webapp/**

Repo → Settings → Pages → Source must be set to **GitHub Actions**.

### Backend CORS

The backend only allows browser requests from origins in its
`ALLOWED_ORIGINS` env var (on Railway). Add the web app origin:

```
https://dariustieku12-pixel.github.io
```

When a custom domain is bought later: change `base` in `vite.config.ts`
to `/`, add the domain to `ALLOWED_ORIGINS`, and point DNS at Pages.
