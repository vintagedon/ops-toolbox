import { afterEach, beforeEach, describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PasswordGenerator from '../../src/tools/PasswordGenerator.jsx';

describe('PasswordGenerator padding bound', () => {
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

  it.each([
    ['13', 12, /\d{12}$/, '101 bits'],
    ['0', 1, /\d{1}$/, '65 bits'],
    ['-3', 1, /\d{1}$/, '65 bits'],
    ['32769', 12, /\d{12}$/, '101 bits'],
  ])('typing %s keeps padding within 1-12 digits with matching output and entropy', async (typed, storedValue, digitsPattern, entropyText) => {
    render(<PasswordGenerator />);
    fireEvent.click(screen.getByText('Passphrase'));
    await screen.findByText('62 bits');

    fireEvent.click(screen.getByLabelText('Append numeric padding'));
    const input = screen.getByLabelText('Padding digits');
    fireEvent.change(input, { target: { value: typed } });

    expect(input).toHaveValue(storedValue);

    const output = await waitFor(() => {
      const text = document.querySelector('pre.font-mono').textContent;
      expect(text).toMatch(digitsPattern);
      return text;
    });
    expect(output).toMatch(digitsPattern);
    expect(screen.queryByText(/padding digit count/i)).not.toBeInTheDocument();
    expect(screen.getByText(entropyText)).toBeInTheDocument();
  });

  it('keeps the displayed count, appended digits, and entropy term at the same number', async () => {
    render(<PasswordGenerator />);
    fireEvent.click(screen.getByText('Passphrase'));
    await screen.findByText('62 bits');

    fireEvent.click(screen.getByLabelText('Append numeric padding'));
    const input = screen.getByLabelText('Padding digits');
    fireEvent.change(input, { target: { value: '7' } });

    expect(input).toHaveValue(7);
    await waitFor(() => expect(document.querySelector('pre.font-mono').textContent).toMatch(/\d{7}$/));
    expect(screen.getByText('85 bits')).toBeInTheDocument();
  });
});
