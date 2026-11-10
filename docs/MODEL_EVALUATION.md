# Model evaluation roadmap

A frequency leader is not the same as a reliable next-outcome prediction.

Current analysis provides descriptive counts, proportions, transitions, streaks, entropy, Wilson confidence interval for the observed top-number share, and chronological walk-forward evaluation.

Before claiming predictive value:
1. Gather a sufficiently large, timestamped result history and deduplicate rounds.
2. Keep a chronological holdout set that is never used for model tuning.
3. Compare with a uniform 10%-per-number probability baseline.
4. Evaluate log loss and Brier score as well as accuracy.
5. Report sample size and uncertainty; do not present an estimated ranking as a guaranteed win.

Candidate models for later research include rolling-frequency shrinkage, Bayesian categorical models, and transition models only when dependence is demonstrated out of sample.

For a fair independent random game, past results alone do not create a reliable edge.
