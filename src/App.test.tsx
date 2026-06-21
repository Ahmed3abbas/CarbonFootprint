import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

describe('App', () => {
  it('shows an estimated footprint and updates when inputs change', async () => {
    const user = userEvent.setup();
    render(<App />);

    expect(screen.getByText(/estimated annual footprint/i)).toBeInTheDocument();
    expect(screen.getByText(/tCO2e/i, { selector: '.summary-value' })).toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText(/commute mode/i), 'bike');
    await user.clear(screen.getByLabelText(/flights per year/i));
    await user.type(screen.getByLabelText(/flights per year/i), '0');

    expect(screen.getByText(/keep commute emissions low/i)).toBeInTheDocument();
  });
});