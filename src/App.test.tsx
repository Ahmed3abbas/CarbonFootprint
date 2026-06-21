import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

describe('App', () => {
  it('shows target progress and updates scenario guidance when inputs change', async () => {
    const user = userEvent.setup();
    render(<App />);

    expect(screen.getByText(/estimated annual footprint/i)).toBeInTheDocument();
    expect(screen.getByText(/target gap/i)).toBeInTheDocument();
    expect(screen.getByText(/best next step/i)).toBeInTheDocument();
    expect(within(screen.getByText(/best next step/i).closest('article') as HTMLElement).getByText(/shift one commute tier down/i, { selector: 'strong' })).toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText(/commute mode/i), 'remote');
    await user.clear(screen.getByLabelText(/flights per year/i));
    await user.type(screen.getByLabelText(/flights per year/i), '0');

    expect(within(screen.getByText(/best next step/i).closest('article') as HTMLElement).getByText(/move home energy to renewable/i, { selector: 'strong' })).toBeInTheDocument();
    expect(screen.getByLabelText(/scenario comparison/i)).toBeInTheDocument();
  });
});