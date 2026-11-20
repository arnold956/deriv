# Trade Desk — Independent Deriv Trading Workspace

A third-party trading workspace using Deriv's public market-data services and authorised account APIs. It is independently branded and is not Deriv's official website or an endorsed product.

## Workspace areas
- **Trade:** live tick chart, market tabs, contract configuration, chart controls, and positions workspace.
- **Markets:** searchable active-symbol catalogue and market categories.
- **Portfolio:** account metrics and open/closed contract workspace.
- **Cashier:** entry points for Deriv's authorised cashier services.
- **Reports and Statement:** account performance and transaction workspaces.
- **Settings and Help:** workspace preferences, security information, and guidance.

## Local setup
```bash
npm install
cp .env.example .env.local
npm run dev
```

## Deriv application configuration
Register an OAuth 2.0 application in Deriv and add its client ID to `.env.local`:

- `NEXT_PUBLIC_DERIV_OAUTH_CLIENT_ID`: OAuth client ID used to start login.
- `DERIV_OAUTH_CLIENT_ID`: server-side copy of the OAuth client ID.
- `NEXT_PUBLIC_DERIV_REDIRECT_URI` and `DERIV_OAUTH_REDIRECT_URI`: the exact callback URL registered in Deriv, e.g. `https://your-domain.example/auth/callback`.
- `NEXT_PUBLIC_DERIV_APP_ID`: app ID used by the public market-data WebSocket client.

The callback URI must match exactly in the Deriv application settings and deployment environment. For production, use HTTPS.

## Authentication and account security
Login uses Deriv OAuth 2.0 Authorization Code with PKCE. The access token is exchanged server-side and stored in an HttpOnly, Secure-in-production, SameSite=Lax cookie. It is never exposed as a browser-readable variable or committed to GitHub. The account endpoint reads the authorised Options account list from Deriv; account balances shown by the workspace are sourced from that response.

Deriv access tokens expire. The current implementation asks the user to sign in again when authorisation expires; it does not assume a refresh token exists.

## Current implementation status
- Public active-symbol catalogue and tick stream: implemented using the current public market-data client.
- OAuth login and server-side token exchange: implemented; requires a registered OAuth client ID and matching redirect URI to test.
- Authenticated Options account list and balance display: implemented; requires the OAuth app to have the `trade` scope.
- Account-scoped WebSocket sessions, proposal pricing, contract purchase/sell, live portfolio subscriptions, cashier flows, statements, and reports: not yet complete.
- Real-money execution remains disabled until the account-scoped WebSocket flow and order confirmation are implemented and tested.

Never edit or fabricate a real Deriv balance. Any future balance-editing feature must be clearly separated as a local-only demo simulation. Never put access tokens or PATs in `NEXT_PUBLIC_*` variables.

## Deployment
Import this repository into Vercel using the Next.js preset. Configure the OAuth environment variables and register the deployed callback URI with Deriv before testing sign-in. This project is separate from Goon FX.
