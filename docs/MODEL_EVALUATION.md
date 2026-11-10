# Model evaluation roadmap

The application currently offers descriptive historical statistics, not a validated next-outcome predictor.

## Current analysis
- Frequency and empirical proportions for 0–9.
- Rolling-window sample.
- Streak and transition counts.
- Entropy and Wilson interval for the observed top-number share.
- Chronological walk-forward evaluation of a simple historical-frequency top pick.

## Before claiming signal
1. Gather timestamped, complete and deduplicated results.
2. Keep a chronological holdout set that is never used for tuning.
3. Compare against a uniform 10%-per-number baseline.
4. Evaluate log loss and Brier score as well as accuracy.
5. Report sample size and uncertainty.
6. Require repeatable out-of-sample improvement before describing any model as informative.

A fair independent random game has no reliably inferable winning number from past outcomes alone. No output should be labelled as a guaranteed win.
