# Carbon Footprint Compass

Carbon Footprint Compass is a compact, accessible React app that helps people estimate a carbon profile, compare realistic reduction scenarios, and focus on the highest-impact next step.

## Chosen Vertical

Carbon footprint awareness platform.

## Approach and Logic

The app uses a typed rules engine to turn a user's commute, home energy, diet, travel, and recycling habits into an estimated annual footprint. It then ranks practical actions by estimated savings, shows a target gap, and compares the projected result of different choices.

## How It Works

1. Users adjust the form to match their lifestyle.
2. The app calculates a footprint estimate from the selected inputs.
3. A recommendation engine ranks actions by estimated annual impact.
4. Scenario cards show the likely result of switching commute, home energy, diet, or flight habits.
5. The dashboard updates immediately so users can compare tradeoffs.

## Assumptions

- The footprint estimate is directional, not a certified audit.
- Factors are intentionally simple so the app remains lightweight and understandable.
- The app focuses on everyday choices rather than detailed utility billing or supply-chain data.
- The target value is a practical benchmark for guidance, not an official emissions limit.

## Development

```bash
npm install
npm run dev
```

## Testing

```bash
npm test
npm run build
```
