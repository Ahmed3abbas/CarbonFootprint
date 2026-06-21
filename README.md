# Carbon Footprint Compass

Carbon Footprint Compass is a compact, accessible React app that helps people estimate a simple carbon profile and get personalized reduction ideas based on daily habits.

## Chosen Vertical

Carbon footprint awareness platform.

## Approach and Logic

The app uses a small rules engine to turn a user's commute, home energy, diet, travel, and recycling habits into an estimated annual footprint. It then ranks practical actions by potential savings so the advice stays specific and useful.

## How It Works

1. Users adjust the form to match their lifestyle.
2. The app calculates a footprint estimate from the selected inputs.
3. A recommendation engine ranks actions by estimated annual impact.
4. The dashboard updates immediately so users can compare tradeoffs.

## Assumptions

- The footprint estimate is directional, not a certified audit.
- Factors are intentionally simple so the app remains lightweight and understandable.
- The app focuses on everyday choices rather than detailed utility billing or supply-chain data.

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
