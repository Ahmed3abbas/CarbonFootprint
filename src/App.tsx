import { useMemo, useState, type ChangeEvent } from 'react';
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

type NumericField = 'commuteMiles' | 'workDaysPerWeek' | 'meatMealsPerWeek' | 'flightsPerYear';
type ChoiceField = 'commuteMode' | 'homeEnergy' | 'recyclingHabit';

function updateField<K extends keyof UserProfile>(profile: UserProfile, key: K, value: UserProfile[K]): UserProfile {
  return {
    ...profile,
    [key]: value,
  };
}

function App() {
  const [profile, setProfile] = useState(defaultProfile);

  const insights = useMemo(() => createInsights(profile), [profile]);

  const handleNumberChange =
    (key: NumericField) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      const nextValue = Number(event.currentTarget.value);
      setProfile((current) => updateField(current, key, nextValue));
    };

  const handleChoiceChange =
    (key: ChoiceField) =>
    (event: ChangeEvent<HTMLSelectElement>) => {
      const nextValue = event.currentTarget.value as UserProfile[typeof key];
      setProfile((current) => updateField(current, key, nextValue));
    };

  return (
    <main className="shell">
      <section className="hero">
        <div className="hero-copy-block">
          <p className="eyebrow">Carbon awareness platform</p>
          <h1>Turn everyday habits into a clearer climate plan.</h1>
          <p className="hero-copy">
            Estimate your footprint, compare realistic reduction scenarios, and see how close you are to a practical annual target.
          </p>
        </div>

        <article className="summary-card" aria-label="Footprint summary">
          <p className="summary-label">Estimated annual footprint</p>
          <div className="summary-value" aria-live="polite">
            {insights.totalTonnes.toFixed(1)} tCO2e
          </div>
          <p className="summary-note">{insights.summary}</p>

          <div className="progress-block" aria-label="Target progress">
            <div className="progress-copy">
              <span>Target gap</span>
              <strong>{insights.gapToTarget.toFixed(1)} t remaining</strong>
            </div>
            <div className="progress-track" aria-hidden="true">
              <div className="progress-fill" style={{ width: `${insights.progressPercent}%` }} />
            </div>
            <p className="progress-caption">{insights.progressPercent}% of the way to the 4.0 tCO2e target.</p>
          </div>
        </article>
      </section>

      <section className="stats-grid" aria-label="Personalized metrics">
        <article className="stat-card">
          <span className="stat-label">Best next step</span>
          <strong>{insights.bestScenario.title}</strong>
          <p>{insights.bestScenario.detail}</p>
        </article>
        <article className="stat-card">
          <span className="stat-label">Estimated savings</span>
          <strong>{insights.bestScenario.savingsTonnes.toFixed(1)} tCO2e</strong>
          <p>Projected if you make the highest-value change first.</p>
        </article>
        <article className="stat-card">
          <span className="stat-label">Problem match</span>
          <strong>{insights.footprintBand === 'high' ? 'High leverage' : insights.footprintBand === 'medium' ? 'Balanced opportunity' : 'Low impact, maintain gains'}</strong>
          <p>{insights.footprintBand === 'high' ? 'The model shows concentrated emissions in one or two areas.' : 'The model shows a more even spread, so several smaller actions matter.'}</p>
        </article>
      </section>

      <section className="layout">
        <form className="panel controls" aria-label="Lifestyle inputs">
          <div className="panel-header">
            <h2>Your profile</h2>
            <p>Adjust the inputs to match how you live today.</p>
          </div>

          <div className="field-group">
            <label htmlFor="commuteMode">Commute mode</label>
            <select id="commuteMode" value={profile.commuteMode} onChange={handleChoiceChange('commuteMode')}>
              {commuteOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="field-group">
            <label htmlFor="commuteMiles">Commute distance per day</label>
            <input id="commuteMiles" type="number" min="0" step="1" value={profile.commuteMiles} onChange={handleNumberChange('commuteMiles')} />
          </div>

          <div className="field-group">
            <div className="field-row">
              <label htmlFor="workDaysPerWeek">Office days per week</label>
              <output className="field-value" htmlFor="workDaysPerWeek">
                {profile.workDaysPerWeek} days
              </output>
            </div>
            <input
              id="workDaysPerWeek"
              type="range"
              min="0"
              max="5"
              value={profile.workDaysPerWeek}
              onChange={handleNumberChange('workDaysPerWeek')}
              aria-describedby="workDaysHelp"
            />
            <p id="workDaysHelp" className="field-help">
              Fewer office days reduce commute emissions immediately.
            </p>
          </div>

          <div className="field-group">
            <label htmlFor="homeEnergy">Home energy mix</label>
            <select id="homeEnergy" value={profile.homeEnergy} onChange={handleChoiceChange('homeEnergy')}>
              {energyOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="field-group">
            <label htmlFor="meatMealsPerWeek">Meat-based meals per week</label>
            <input id="meatMealsPerWeek" type="number" min="0" max="21" step="1" value={profile.meatMealsPerWeek} onChange={handleNumberChange('meatMealsPerWeek')} />
          </div>

          <div className="field-group">
            <label htmlFor="flightsPerYear">Flights per year</label>
            <input id="flightsPerYear" type="number" min="0" step="1" value={profile.flightsPerYear} onChange={handleNumberChange('flightsPerYear')} />
          </div>

          <div className="field-group">
            <label htmlFor="recyclingHabit">Recycling habit</label>
            <select id="recyclingHabit" value={profile.recyclingHabit} onChange={handleChoiceChange('recyclingHabit')}>
              {recyclingOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </form>

        <section className="panel insights" aria-label="Impact insights">
          <div className="panel-header">
            <h2>What is driving your footprint</h2>
            <p>The largest categories are shown first so the advice stays focused.</p>
          </div>

          <div className="bars" aria-label="Emissions by category">
            {insights.categories.map((item) => (
              <article className="bar-row" key={item.key} aria-label={`${item.label} contribution`}>
                <div className="bar-copy">
                  <span>{item.label}</span>
                  <strong>{item.value.toFixed(1)} t</strong>
                </div>
                <div className="bar-track" aria-hidden="true">
                  <div className="bar-fill" style={{ width: `${Math.min(100, item.share)}%` }} />
                </div>
                <p className="bar-note">
                  {item.note} {item.share > 0 ? `About ${item.share.toFixed(1)}% of your total.` : ''}
                </p>
              </article>
            ))}
          </div>

          <div className="recommendations" aria-label="Priority actions">
            <h3>Priority actions</h3>
            <ul>
              {insights.recommendations.map((item) => (
                <li key={item.key}>
                  <strong>{item.title}</strong>
                  <span>{item.detail}</span>
                  <em>{item.savingsTonnes > 0 ? `Potential savings: ${item.savingsTonnes.toFixed(1)} tCO2e` : 'Maintain this habit as a baseline.'}</em>
                </li>
              ))}
            </ul>
          </div>

          <div className="scenario-grid" aria-label="Scenario comparison">
            {insights.scenarios.map((scenario) => (
              <article className="scenario-card" key={scenario.key}>
                <span className="stat-label">{scenario.title}</span>
                <strong>{scenario.savingsTonnes.toFixed(1)} tCO2e saved</strong>
                <p>{scenario.detail}</p>
                <small>
                  Current: {scenario.currentTonnes.toFixed(1)} t | After change: {scenario.projectedTonnes.toFixed(1)} t
                </small>
              </article>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}

export default App;