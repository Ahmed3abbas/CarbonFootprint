export type UserProfile = {
  commuteMode: 'car' | 'bus' | 'bike' | 'remote';
  commuteMiles: number;
  workDaysPerWeek: number;
  homeEnergy: 'coal' | 'mixed' | 'renewable';
  meatMealsPerWeek: number;
  flightsPerYear: number;
  recyclingHabit: 'rarely' | 'sometimes' | 'consistently';
};

type BreakdownItem = {
  label: string;
  value: number;
  percent: number;
};

type Recommendation = {
  title: string;
  detail: string;
};

type Insights = {
  totalTonnes: number;
  summary: string;
  breakdown: BreakdownItem[];
  recommendations: Recommendation[];
};

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

export function calculateFootprint(profile: UserProfile) {
  const officeDays = Math.max(0, Math.min(5, profile.workDaysPerWeek));
  const commute = profile.commuteMiles * officeDays * 2 * 46 * commuteFactors[profile.commuteMode];
  const home = energyFactors[profile.homeEnergy];
  const diet = profile.meatMealsPerWeek * 0.12;
  const flights = profile.flightsPerYear * 0.42;
  const recycling = recyclingOffsets[profile.recyclingHabit];

  const rawTotal = commute + home + diet + flights - recycling;
  return Math.max(1.1, Number(rawTotal.toFixed(1)));
}

export function createInsights(profile: UserProfile): Insights {
  const commute = Number((profile.commuteMiles * profile.workDaysPerWeek * 2 * 46 * commuteFactors[profile.commuteMode]).toFixed(1));
  const home = Number(energyFactors[profile.homeEnergy].toFixed(1));
  const diet = Number((profile.meatMealsPerWeek * 0.12).toFixed(1));
  const flights = Number((profile.flightsPerYear * 0.42).toFixed(1));
  const recycling = Number(recyclingOffsets[profile.recyclingHabit].toFixed(1));

  const totalTonnes = calculateFootprint(profile);
  const breakdownData = [
    { label: 'Commute', value: commute },
    { label: 'Home energy', value: home },
    { label: 'Food', value: diet },
    { label: 'Flights', value: flights },
    { label: 'Recycling', value: recycling },
  ];

  const largest = Math.max(...breakdownData.map((item) => item.value));
  const breakdown = breakdownData.map((item) => ({
    ...item,
    percent: largest === 0 ? 0 : Math.max(8, Math.round((item.value / largest) * 100)),
  }));

  const recommendations: Recommendation[] = [
    {
      title: profile.commuteMode === 'car' ? 'Replace two car days with transit' : 'Keep commute emissions low',
      detail: profile.commuteMode === 'car'
        ? 'Shifting part of the commute to transit could save about 0.4 tCO2e each year.'
        : 'Your commute is already lighter than most profiles, so home energy and food matter more.',
    },
    {
      title: profile.homeEnergy === 'coal' ? 'Move to a cleaner electricity plan' : 'Improve home efficiency next',
      detail: profile.homeEnergy === 'coal'
        ? 'A greener grid or renewable plan would cut a meaningful share of your annual footprint.'
        : 'Better insulation, LEDs, and lower standby loads become the highest-value household moves.',
    },
    {
      title: profile.meatMealsPerWeek > 5 ? 'Swap a few meat meals' : 'Diet is already a strong point',
      detail: profile.meatMealsPerWeek > 5
        ? 'Replacing three meals per week with plant-based options trims food emissions without major lifestyle change.'
        : 'Your food pattern is already moderate, so the biggest wins are elsewhere.',
    },
  ];

  const summary =
    totalTonnes > 8
      ? 'This profile is above the typical target range. Transport and food changes will have the fastest payoff.'
      : totalTonnes > 5
        ? 'You are in a middle band. Focus on one commute change and one home-energy upgrade.'
        : 'This profile is already relatively lean. Keep the momentum with small efficiency and travel choices.';

  return { totalTonnes, summary, breakdown, recommendations };
}