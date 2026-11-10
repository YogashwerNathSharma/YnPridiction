# YnPrediction

A standalone trend-analysis and probability dashboard for studying historical game outcomes.

> **Important:** This project is an educational statistical-analysis tool. It does not predict random outcomes with certainty, guarantee wins, or provide betting advice. Historical patterns may not persist.

## Initial stack
- Frontend: React + TypeScript + Vite
- Backend: Node.js + Express
- Analysis: deterministic statistics (frequency, streaks, transitions, rolling windows)
- Storage: MongoDB integration planned; initial API can run without a database

## Repository layout
```
client/       React dashboard
server/       Express API and analysis engine
docs/         architecture and methodology
```

## Run locally
### API
```bash
cd server
npm install
cp .env.example .env
npm run dev
```
API default: http://localhost:4000

### Frontend
```bash
cd client
npm install
npm run dev
```
Frontend default: http://localhost:5173

Set `VITE_API_URL=http://localhost:4000` in `client/.env` if needed.

## Data
Enter historical results manually through the dashboard or API. Only use sources you are authorized to access. Do not scrape sites that prohibit automated access.

## Analysis methodology
- Frequency counts and empirical proportions
- Rolling-window distribution comparisons
- Current/max streaks
- First-order transition counts
- Baseline comparison and out-of-sample accuracy tracking

The dashboard should show sample size and uncertainty. For independent uniform 0–9 outcomes, the baseline probability of each number is 10%; observed frequency differences alone do not prove predictive signal.

## Status
Starter foundation only. Authentication, persistent database storage, production deployment, automated result ingestion, and formal model validation are not yet implemented.
