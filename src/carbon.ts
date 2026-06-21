export type UserProfile = {
  commuteMode: 'car' | 'bus' | 'bike' | 'remote';
  commuteMiles: number;
  workDaysPerWeek: number;
  homeEnergy: 'coal' | 'mixed' | 'renewable';
  meatMealsPerWeek: number;
  flightsPerYear: number;
  recyclingHabit: 'rarely' | 'sometimes' | 'consistently';
};

export type FootprintCategoryKey = 'commute' | 'homeEnergy' | 'diet' | 'flights' | 'recycling';
export type ScenarioKey = 'commute' | 'homeEnergy' | 'diet' | 'flights';

export type FootprintCategory = {
  key: FootprintCategoryKey;
  label: string;
  value: number;
  share: number;
  note: string;
};

export type Scenario = {
  key: ScenarioKey;
  title: string;
  detail: string;
  currentTonnes: number;
  projectedTonnes: number;
  savingsTonnes: number;
};

export type Recommendation = {
  key: ScenarioKey;
  title: string;
  detail: string;
  savingsTonnes: number;
};

export type Insights = {
  totalTonnes: number;
  targetTonnes: number;
  gapToTarget: number;
  progressPercent: number;
  footprintBand: 'low' | 'medium' | 'high';
  summary: string;
  categories: FootprintCategory[];
  recommendations: Recommendation[];
  scenarios: Scenario[];
  bestScenario: Scenario;
};

const COMMUTE_WEEKS_PER_YEAR = 46;
const TARGET_TONNES = 4;
const MIN_TONNES = 1;

const commuteFactors: Record<UserProfile['commuteMode'], number> = {
  car: 0.00036,
  bus: 0.00014,
  bike: 0.00003,
  remote: 0.00001,
};

const energyFactors: Record<UserProfile['homeEnergy'], number> = {
  coal: 2.7,
  mixed: 1.7,
  renewable: 0.8,
};

const recyclingOffsets: Record<UserProfile['recyclingHabit'], number> = {
  rarely: 0.08,
  sometimes: 0.16,
  consistently: 0.3,
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function roundToTenth(value: number) {
  return Number(value.toFixed(1));
}

function normalizeProfile(profile: UserProfile): UserProfile {
  return {
    ...profile,
    commuteMiles: clamp(profile.commuteMiles, 0, 250),
    workDaysPerWeek: clamp(profile.workDaysPerWeek, 0, 5),
    meatMealsPerWeek: clamp(profile.meatMealsPerWeek, 0, 21),
    flightsPerYear: clamp(profile.flightsPerYear, 0, 50),
  };
}

function calculateComponents(profile: UserProfile) {
  const normalized = normalizeProfile(profile);
  const commute = normalized.commuteMiles * normalized.workDaysPerWeek * 2 * COMMUTE_WEEKS_PER_YEAR * commuteFactors[normalized.commuteMode];
  const homeEnergy = energyFactors[normalized.homeEnergy];
  const diet = normalized.meatMealsPerWeek * 0.12;
  const flights = normalized.flightsPerYear * 0.42;
  const recycling = recyclingOffsets[normalized.recyclingHabit];
  const rawTotal = commute + homeEnergy + diet + flights - recycling;

  return {
    normalized,
    commute,
    homeEnergy,
    diet,
    flights,
    recycling,
    totalTonnes: Math.max(MIN_TONNES, roundToTenth(rawTotal)),
  };
}

function projectProfile(profile: UserProfile, patch: Partial<UserProfile>): UserProfile {
  return {
    ...profile,
    ...patch,
  };
}

function buildScenario(profile: UserProfile, key: ScenarioKey): Scenario {
  const current = calculateComponents(profile).totalTonnes;
  let projectedProfile = profile;

  if (key === 'commute') {
    projectedProfile = projectProfile(profile, {
      commuteMode: profile.commuteMode === 'car' ? 'bus' : profile.commuteMode === 'bus' ? 'bike' : 'remote',
    });
  }

  if (key === 'homeEnergy') {
    projectedProfile = projectProfile(profile, { homeEnergy: 'renewable' });
  }

  if (key === 'diet') {
    projectedProfile = projectProfile(profile, {
      meatMealsPerWeek: Math.max(0, profile.meatMealsPerWeek - Math.max(2, Math.ceil(profile.meatMealsPerWeek / 2))),
    });
  }

  if (key === 'flights') {
    projectedProfile = projectProfile(profile, {
      flightsPerYear: Math.max(0, profile.flightsPerYear - Math.max(1, Math.ceil(profile.flightsPerYear / 2))),
    });
  }

  const projectedTonnes = calculateFootprint(projectedProfile);
  const savingsTonnes = roundToTenth(Math.max(0, current - projectedTonnes));

  const scenarioDetails: Record<ScenarioKey, Omit<Scenario, 'currentTonnes' | 'projectedTonnes' | 'savingsTonnes'>> = {
    commute: {
      key: 'commute',
      title: 'Shift one commute tier down',
      detail: 'Move from car to transit, transit to active travel, or active travel to remote work where possible.',
    },
    homeEnergy: {
      key: 'homeEnergy',
      title: 'Move home energy to renewable',
      detail: 'A cleaner electricity mix is the largest household lever in this model.',
    },
    diet: {
      key: 'diet',
      title: 'Cut meat meals by half',
      detail: 'Reducing weekly meat meals is a low-friction way to lower food emissions.',
    },
    flights: {
      key: 'flights',
      title: 'Reduce annual flights',
      detail: 'Avoiding even one flight has a meaningful effect in most profiles.',
    },
  };

  return {
    ...scenarioDetails[key],
    currentTonnes: current,
    projectedTonnes,
    savingsTonnes,
  };
}

function buildCategories(components: ReturnType<typeof calculateComponents>): FootprintCategory[] {
  const netEmissions = components.totalTonnes;
  const categories = [
    { key: 'commute' as const, label: 'Commute', value: components.commute, note: 'Daily travel to work or school.' },
    { key: 'homeEnergy' as const, label: 'Home energy', value: components.homeEnergy, note: 'Electricity and household power use.' },
    { key: 'diet' as const, label: 'Food', value: components.diet, note: 'Meat-heavy meals drive this category.' },
    { key: 'flights' as const, label: 'Flights', value: components.flights, note: 'Air travel adds quickly over the year.' },
    { key: 'recycling' as const, label: 'Recycling savings', value: components.recycling, note: 'Consistent recycling slightly offsets emissions.' },
  ];

  return categories.map((category) => ({
    ...category,
    share: netEmissions === 0 ? 0 : roundToTenth((category.value / netEmissions) * 100),
  }));
}

function buildRecommendations(profile: UserProfile, scenarios: Scenario[]): Recommendation[] {
  return scenarios
    .slice()
    .sort((left, right) => right.savingsTonnes - left.savingsTonnes)
    .map((scenario) => ({
      key: scenario.key,
      title: scenario.title,
      detail: scenario.detail,
      savingsTonnes: scenario.savingsTonnes,
    }))
    .concat(
      profile.recyclingHabit !== 'consistently'
        ? [{ key: 'commute', title: 'Keep recycling consistent', detail: 'Recycling is a small but steady offset that supports the larger changes.', savingsTonnes: 0.1 }]
        : [],
    )
    .slice(0, 4);
}

export function calculateFootprint(profile: UserProfile) {
  return calculateComponents(profile).totalTonnes;
}

export function createInsights(profile: UserProfile): Insights {
  const components = calculateComponents(profile);
  const scenarioKeys: ScenarioKey[] = ['commute', 'homeEnergy', 'diet', 'flights'];
  const scenarios: Scenario[] = scenarioKeys.map((key) => buildScenario(profile, key));
  const bestScenario = scenarios.reduce((best, scenario) => (scenario.savingsTonnes > best.savingsTonnes ? scenario : best), scenarios[0]);
  const targetTonnes = TARGET_TONNES;
  const gapToTarget = Math.max(0, roundToTenth(components.totalTonnes - targetTonnes));
  const progressPercent = clamp(Math.round((targetTonnes / components.totalTonnes) * 100), 0, 100);

  const footprintBand: Insights['footprintBand'] = components.totalTonnes <= 4 ? 'low' : components.totalTonnes <= 8 ? 'medium' : 'high';
  const summary =
    footprintBand === 'high'
      ? 'This profile is above the preferred range. Focus on the largest scenario in the right-hand panel first.'
      : footprintBand === 'medium'
        ? 'You are in a middle band. One commute shift and one home-energy improvement will move the needle fastest.'
        : 'Your footprint is already relatively lean. Keep the balance by preserving the lower-impact habits that are working.';

  return {
    totalTonnes: components.totalTonnes,
    targetTonnes,
    gapToTarget,
    progressPercent,
    footprintBand,
    summary,
    categories: buildCategories(components),
    recommendations: buildRecommendations(profile, scenarios),
    scenarios,
    bestScenario,
  };
}