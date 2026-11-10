# YnPrediction architecture

## Components
- React client: result entry, history, trend views, analysis output.
- Express API: validation, result CRUD boundary, analysis endpoint.
- Analysis module: pure functions that can be unit-tested without network/database access.
- Persistence adapter: planned MongoDB repository implementation.

## Data contract
A result is one observed outcome:
```json
{
  "period": "1m",
  "roundId": "optional-source-round-id",
  "value": 7,
  "color": "green",
  "observedAt": "2026-11-10T06:30:00.000Z"
}
```
Values are integers 0–9. Color is optional and user/source-defined; do not assume a color mapping without a verified game rule.

## Analysis contract
The engine returns:
- sample size and selected window
- per-number counts and empirical proportions
- recent streaks
- transition counts
- descriptive ranking clearly marked as historical frequency, not a next-round certainty

A model must be evaluated on chronological holdout data. Never calculate accuracy on the same observations used to fit or tune the model.
