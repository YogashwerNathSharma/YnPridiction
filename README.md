# YnPrediction

A standalone historical trend-analysis dashboard for Sikkim-style 0–9 result histories.

> **No guaranteed winning predictions.** The application summarizes historical patterns and backtests simple statistical baselines. It cannot make a genuinely random independent draw predictable.

## Stack
- React + TypeScript + Vite
- Node.js + Express
- Statistical analysis: frequencies, streaks, transitions, entropy and chronological walk-forward backtest

## Layout
- `client/` — React dashboard
- `server/` — Express API and pure analysis engine
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

## Current scope
- Manual result entry (0–9)
- Historical frequency chart and ranking
- Streak and transition analysis
- Wilson interval for observed frequency
- Chronological walk-forward evaluation
- API health, result list, add, clear and analysis endpoints

**Data note:** The current server stores results in memory. Restarting the server clears them. MongoDB persistence, login, automated result import, formal Brier-score evaluation and production deployment are not yet implemented.

See [model evaluation](docs/MODEL_EVALUATION.md) and [methodology](docs/METHODOLOGY.md).
