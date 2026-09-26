import { afterEach, beforeEach, describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PasswordGenerator from '../../src/tools/PasswordGenerator.jsx';

describe('PasswordGenerator separator policy', () => {
  beforeEach(() => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('marks the withdrawn Original Diceware separators as unavailable with a reason', async () => {
    render(<PasswordGenerator />);
    fireEvent.click(screen.getByText('Passphrase'));
    await screen.findByText('62 bits');

    fireEvent.change(screen.getByLabelText('Wordlist'), { target: { value: 'diceware' } });
    await screen.findByText('77 bits');

    const noneOption = screen.getByRole('option', { name: 'None' });
    expect(noneOption).toBeDisabled();
    const dotOption = screen.getByRole('option', { name: 'Dot (.)' });
    expect(dotOption).toBeDisabled();
    expect(screen.getByRole('option', { name: 'Hyphen (-)' })).toBeEnabled();

    expect(screen.getByText(/identical output/i)).toBeInTheDocument();
  });

  it('keeps every separator available for the EFF lists', async () => {
    render(<PasswordGenerator />);
    fireEvent.click(screen.getByText('Passphrase'));
    await screen.findByText('62 bits');

    expect(screen.getByRole('option', { name: 'None' })).toBeEnabled();
    fireEvent.change(screen.getByLabelText('Wordlist'), { target: { value: 'eff-long' } });
    await screen.findByText('77 bits');
    expect(screen.getByRole('option', { name: 'None' })).toBeEnabled();
    expect(screen.queryByText(/identical output/i)).not.toBeInTheDocument();
  });

  it('resolves a withdrawn selection to an available separator and says why', async () => {
    render(<PasswordGenerator />);
    fireEvent.click(screen.getByText('Passphrase'));
    await screen.findByText('62 bits');

    // The wordlist select renders first; the separator select is the second combobox.
    const separatorSelect = screen.getAllByRole('combobox')[1];
    fireEvent.change(separatorSelect, { target: { value: '' } });
    await waitFor(() => expect(document.querySelector('pre.font-mono').textContent).not.toContain('-'));

    fireEvent.change(screen.getByLabelText('Wordlist'), { target: { value: 'diceware' } });

    await waitFor(() => expect(separatorSelect).toHaveValue('-'));
    expect(screen.getByText(/identical output/i)).toBeInTheDocument();

    await waitFor(() => {
      const output = document.querySelector('pre.font-mono').textContent;
      expect(output).toContain('-');
    });
    expect(screen.getByText('77 bits')).toBeInTheDocument();
  });

  it('keeps the displayed entropy of surviving combinations unchanged', async () => {
    render(<PasswordGenerator />);
    fireEvent.click(screen.getByText('Passphrase'));
    await screen.findByText('62 bits');

    fireEvent.change(screen.getByLabelText('Wordlist'), { target: { value: 'diceware' } });
    await screen.findByText('77 bits');

    const separatorSelect = screen.getAllByRole('combobox')[1];
    fireEvent.change(separatorSelect, { target: { value: ' ' } });
    await waitFor(() => {
      const output = document.querySelector('pre.font-mono').textContent;
      expect(output).toContain(' ');
    });
    expect(screen.getByText('77 bits')).toBeInTheDocument();
  });
});
