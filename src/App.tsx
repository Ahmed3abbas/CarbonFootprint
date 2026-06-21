import { useMemo, useState } from 'react';
import { createInsights, type UserProfile } from './carbon';

const defaultProfile: UserProfile = {
  commuteMode: 'car',
  commuteMiles: 18,
  workDaysPerWeek: 5,
  homeEnergy: 'mixed',
  meatMealsPerWeek: 8,
  flightsPerYear: 2,
  recyclingHabit: 'sometimes',
};

const commuteOptions: Array<{ value: UserProfile['commuteMode']; label: string }> = [
  { value: 'car', label: 'Car' },
  { value: 'bus', label: 'Bus' },
  { value: 'bike', label: 'Bike / walk' },
  { value: 'remote', label: 'Mostly remote' },
];

const energyOptions: Array<{ value: UserProfile['homeEnergy']; label: string }> = [
  { value: 'coal', label: 'Coal-heavy grid' },
  { value: 'mixed', label: 'Mixed grid' },
  { value: 'renewable', label: 'Renewable-first grid' },
];

const recyclingOptions: Array<{ value: UserProfile['recyclingHabit']; label: string }> = [
  { value: 'rarely', label: 'Rarely' },
  { value: 'sometimes', label: 'Sometimes' },
  { value: 'consistently', label: 'Consistently' },
];

function updateProfile(profile: UserProfile, key: keyof UserProfile, value: string | number): UserProfile {
  return {
    ...profile,
    [key]: value,
  } as UserProfile;
}

function App() {
  const [profile, setProfile] = useState(defaultProfile);

  const insights = useMemo(() => createInsights(profile), [profile]);

  const handleChange = (key: keyof UserProfile) => (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const isNumericInput = event.target instanceof HTMLInputElement && (event.target.type === 'number' || event.target.type === 'range');
    const nextValue = isNumericInput ? Number(event.target.value) : event.target.value;
    setProfile((current) => updateProfile(current, key, nextValue));
  };

  return (
    <main className="shell">
      <section className="hero">
        <div>
          <p className="eyebrow">Carbon awareness platform</p>
          <h1>Turn everyday habits into a clearer climate plan.</h1>
          <p className="hero-copy">
            Estimate your footprint, see what is driving it, and get a ranked action list that is easy to act on.
          </p>
        </div>

        <article className="summary-card" aria-label="Footprint summary">
          <p className="summary-label">Estimated annual footprint</p>
          <div className="summary-value" aria-live="polite">
            {insights.totalTonnes.toFixed(1)} tCO2e
          </div>
          <p className="summary-note">{insights.summary}</p>
        </article>
      </section>

      <section className="layout">
        <form className="panel controls" aria-label="Lifestyle inputs">
          <div className="panel-header">
            <h2>Your profile</h2>
            <p>Adjust the inputs to match how you live today.</p>
          </div>

          <label>
            Commute mode
            <select value={profile.commuteMode} onChange={handleChange('commuteMode')}>
              {commuteOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label>
            Commute distance per day
            <input type="number" min="0" step="1" value={profile.commuteMiles} onChange={handleChange('commuteMiles')} />
          </label>

          <label>
            Office days per week
            <input type="range" min="0" max="5" value={profile.workDaysPerWeek} onChange={handleChange('workDaysPerWeek')} />
            <span className="range-value">{profile.workDaysPerWeek} days</span>
          </label>

          <label>
            Home energy mix
            <select value={profile.homeEnergy} onChange={handleChange('homeEnergy')}>
              {energyOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label>
            Meat-based meals per week
            <input type="number" min="0" max="21" step="1" value={profile.meatMealsPerWeek} onChange={handleChange('meatMealsPerWeek')} />
          </label>

          <label>
            Flights per year
            <input type="number" min="0" step="1" value={profile.flightsPerYear} onChange={handleChange('flightsPerYear')} />
          </label>

          <label>
            Recycling habit
            <select value={profile.recyclingHabit} onChange={handleChange('recyclingHabit')}>
              {recyclingOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </form>

        <section className="panel insights" aria-label="Impact insights">
          <div className="panel-header">
            <h2>What is driving your footprint</h2>
            <p>The largest categories are shown first so the advice stays focused.</p>
          </div>

          <div className="bars" aria-label="Emissions by category">
            {insights.breakdown.map((item) => (
              <div className="bar-row" key={item.label}>
                <div className="bar-copy">
                  <span>{item.label}</span>
                  <strong>{item.value.toFixed(1)} t</strong>
                </div>
                <div className="bar-track" aria-hidden="true">
                  <div className="bar-fill" style={{ width: `${item.percent}%` }} />
                </div>
              </div>
            ))}
          </div>

          <div className="recommendations">
            <h3>Priority actions</h3>
            <ul>
              {insights.recommendations.map((item) => (
                <li key={item.title}>
                  <strong>{item.title}</strong>
                  <span>{item.detail}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </section>
    </main>
  );
}

export default App;