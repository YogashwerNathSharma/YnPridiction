# YnPrediction

A standalone historical trend-analysis dashboard for 0–9 result histories.

> **No guaranteed winning predictions.** The application summarizes historical patterns and backtests simple statistical baselines. It cannot make a genuinely random independent draw predictable.

## Stack
- React + TypeScript + Vite
- Node.js + Express
- MongoDB via Mongoose (optional; in-memory mode is available for local trials)
- Statistical analysis: frequencies, streaks, transitions, entropy and chronological walk-forward backtest

## Layout
- `client/` — React dashboard
- `server/` — Express API, storage adapter and analysis engine
- `docs/` — architecture, methodology and evaluation guidance

## Run locally
Backend:
```bash
cd server
npm install
cp .env.example .env
npm run dev
```
Frontend in another terminal:
```bash
cd client
npm install
npm run dev
```
Open http://localhost:5173. API defaults to http://localhost:4000.

## Persistent storage
Set `MONGODB_URI` in `server/.env` to a MongoDB connection string to enable persistent result storage. Without it, the API uses temporary in-memory storage and data is lost when the process restarts. Do not commit real credentials. If a configured MongoDB connection drops, the API returns an error rather than silently switching to temporary storage.

## Current scope
- Manual result entry (0–9)
- Historical frequency chart and ranking
- Streak and transition analysis
- Wilson interval for observed frequency
- Chronological walk-forward evaluation
- API health, result list, add, clear and analysis endpoints
- Optional MongoDB persistence

Authentication, automated result import, formal Brier-score evaluation, production deployment and full runtime verification are not yet implemented.

See [model evaluation](docs/MODEL_EVALUATION.md) and [methodology](docs/METHODOLOGY.md).
