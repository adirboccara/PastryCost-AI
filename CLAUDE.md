# PastryCost AI - Agent Operating Guidelines

## Core Principles
1. **Strict Separation of Concerns**: Sequential agent pipelines must pass typed, validated state. No mixing of physical risk analysis with raw pricing logic.
2. **Defensive Financials**: Profit margins must never fall below baseline thresholds regardless of external risk factors.
3. **Structured Outputs**: All internal reasoning between agents must serialize cleanly into defined JSON structures.
4. **Verification First**: Any logic modification must be accompanied or validated by automated assertions in `tests/`.

## Test Commands
- Run test suite: `npm test`
