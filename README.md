# Trade Desk — Independent Deriv Trading Workspace

A third-party trading interface built around Deriv's public market data and (in later stages) authorised account APIs. It is not Deriv's official website, does not use Deriv branding assets, and is not affiliated with or endorsed by Deriv.

## Pages included
- Trade: live market chart, market selector, contract configuration, order preview, positions tabs.
- Markets: searchable live active-symbol catalogue and market categories.
- Portfolio: account metrics and open/closed contract workspace.
- Cashier: deposit, withdrawal and transfer entry points (requires Deriv authorisation).
- Reports: performance, profit/loss and trade analysis sections.
- Statement: account transaction history workspace.
- Settings: profile, trading preferences, security and notifications.
- Help: platform guidance and security notes.

## Run locally
```bash
npm install
cp .env.example .env.local
npm run dev
```

## Environment
Set `NEXT_PUBLIC_DERIV_APP_ID` to your Deriv application ID. Public market data uses Deriv's WebSocket API. Do not place account tokens in browser code or commit secrets.

## Integration status
The market catalogue and tick stream use the public Deriv WebSocket. Authenticated OAuth, account balance retrieval, cashier actions, proposal pricing, contract purchase, open-contract monitoring, settlement, and real reports still require implementation and testing. Trade execution is deliberately disabled until those steps are complete. Real balances are never editable or fabricated; any future editable balance feature must be confined to a clearly labelled local demo simulator.

## Deploy
Import this repository into Vercel with the Next.js preset. Add environment variables and deploy. This repository is independent of any other trading project.
