# Deriv Trading Workspace

An independent third-party trading workspace that connects to Deriv's official APIs. It is not affiliated with or endorsed by Deriv.

## Stack
- Next.js 15, React 19, TypeScript, Tailwind CSS
- Deriv public WebSocket market feed
- Lightweight Charts dependency for charting

## Run locally
```bash
npm install
cp .env.example .env.local
npm run dev
```
Open http://localhost:3000.

## Current status
- Responsive trading workspace UI and live public market feed.
- Market catalogue and live tick stream with symbol switching.
- Trade controls are intentionally in preview mode until authenticated Deriv OAuth, proposal/buy flow, and contract monitoring are implemented.
- Never enter a real account token into client-side code or commit secrets.

## Environment
Set `NEXT_PUBLIC_DERIV_APP_ID` to the Deriv application ID configured for this project. Configure the redirect URI in the Deriv application settings. OAuth callback and server-side token handling are a subsequent implementation step.

## Safety and account integrity
Displayed live prices are sourced from Deriv's public market feed. Real balances must only be read from the authenticated Deriv account. Editable balances, if later added, must be isolated demo simulations and never overwrite or impersonate real account balances.

## Deployment
Import this repository into Vercel, use the Next.js preset, add the environment variables, and deploy. The frontend is independently hosted; no GOON FX project or domain is modified.
