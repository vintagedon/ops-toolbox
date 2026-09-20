import { afterEach, describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import PasswordGenerator from '../../src/tools/PasswordGenerator.jsx';

describe('PasswordGenerator', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('renders without crashing', () => {
    render(<PasswordGenerator />);
    expect(screen.getByText('Password Generator')).toBeInTheDocument();
  });

  it('displays a generated password on mount', () => {
    render(<PasswordGenerator />);
    expect(screen.getByText('Generated Password')).toBeInTheDocument();
  });

  it('password display element has monospace styling (font-mono class)', () => {
    render(<PasswordGenerator />);
    const passwordElement = screen.getByText('Generated Password').closest('.space-y-4').querySelector('.font-mono');
    expect(passwordElement).toBeInTheDocument();
  });

  it('shows entropy estimate text', () => {
    render(<PasswordGenerator />);
    expect(screen.getByText('Password Entropy')).toBeInTheDocument();
  });

  it('displays error when all character pools are disabled', () => {
    render(<PasswordGenerator />);
    // Uncheck all character pools
    fireEvent.click(screen.getByText('Uppercase'));
    fireEvent.click(screen.getByText('Lowercase'));
    fireEvent.click(screen.getByText('0-9'));
    fireEvent.click(screen.getByText('!@#$%^&*()'));
    expect(screen.getByText('Enable at least one character set')).toBeInTheDocument();
  });

  it('renders mode toggle with Password and Passphrase buttons', () => {
    render(<PasswordGenerator />);
    expect(screen.getByText('Password')).toBeInTheDocument();
    expect(screen.getByText('Passphrase')).toBeInTheDocument();
  });

  it('switching to Passphrase mode shows word count slider', () => {
    render(<PasswordGenerator />);
    fireEvent.click(screen.getByText('Passphrase'));
    expect(screen.getByLabelText('Word Count')).toBeInTheDocument();
  });

  it('switching to Passphrase mode hides character pool toggles', () => {
    render(<PasswordGenerator />);
    fireEvent.click(screen.getByText('Passphrase'));
    expect(screen.queryByText('Uppercase')).not.toBeInTheDocument();
  });

  it('passphrase mode generates output with word separators', async () => {
    render(<PasswordGenerator />);
    fireEvent.click(screen.getByText('Passphrase'));
    const pre = await waitFor(() => document.querySelector('pre.font-mono'));
    expect(pre).toBeInTheDocument();
    expect(pre.textContent).toMatch(/-/);
  });

  it('offers all published wordlists and updates entropy for a larger list', async () => {
    render(<PasswordGenerator />);
    fireEvent.click(screen.getByText('Passphrase'));

    const selector = screen.getByLabelText('Wordlist');
    expect(screen.getByRole('option', { name: 'EFF Short 2.0 (1,296 words)' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'EFF Long (7,776 words)' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Original Diceware (7,776 entries)' })).toBeInTheDocument();
    await screen.findByText('62 bits');

    fireEvent.change(selector, { target: { value: 'eff-long' } });
    await screen.findByText('77 bits');
  });

  it('adds numeric padding with honest entropy guidance', async () => {
    render(<PasswordGenerator />);
    fireEvent.click(screen.getByText('Passphrase'));
    await screen.findByText('62 bits');

    expect(screen.getByText(/padding helps satisfy password rules/i)).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText('Append numeric padding'));
    fireEvent.change(screen.getByLabelText('Padding digits'), { target: { value: '3' } });

    await screen.findByText('72 bits');
    const output = document.querySelector('pre.font-mono');
    expect(output.textContent).toMatch(/\d{3}$/);
  });

  it('renders distinct password rows with entropy and batch actions when count exceeds one', async () => {
    render(<PasswordGenerator />);
    fireEvent.change(screen.getByLabelText('Generation Count'), { target: { value: '3' } });

    const table = await screen.findByRole('table', { name: 'Generated password batch' });
    const rows = within(table).getAllByRole('row');
    expect(rows).toHaveLength(4);
    const values = Array.from(table.querySelectorAll('tbody code'), (element) => element.textContent);
    expect(new Set(values).size).toBe(3);
    expect(within(table).getAllByText('154 bits')).toHaveLength(3);
    expect(screen.getByRole('button', { name: 'Copy All' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Download CSV' })).toBeInTheDocument();
    expect(within(table).getAllByRole('button', { name: /Copy row/ })).toHaveLength(3);
    expect(screen.getByText(/CSV contains unencrypted secrets on disk/i)).toBeInTheDocument();
  });

  it('keeps the single-result card when count is one', () => {
    render(<PasswordGenerator />);
    expect(screen.getByText('Generated Password')).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Copy to Clipboard' })).toBeInTheDocument();
  });

  it('renders passphrase batches with passphrase entropy', async () => {
    render(<PasswordGenerator />);
    fireEvent.click(screen.getByText('Passphrase'));
    fireEvent.change(screen.getByLabelText('Generation Count'), { target: { value: '3' } });

    const table = await screen.findByRole('table', { name: 'Generated passphrase batch' });
    expect(within(table).getAllByText('62 bits')).toHaveLength(3);
  });

  it('creates a non-empty CSV download from the displayed batch', async () => {
    const createObjectURL = vi.fn(() => 'blob:generated-secrets');
    const revokeObjectURL = vi.fn();
    vi.stubGlobal('URL', { createObjectURL, revokeObjectURL });
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});

    render(<PasswordGenerator />);
    fireEvent.change(screen.getByLabelText('Generation Count'), { target: { value: '2' } });
    await screen.findByRole('table', { name: 'Generated password batch' });
    fireEvent.click(screen.getByRole('button', { name: 'Download CSV' }));

    expect(createObjectURL).toHaveBeenCalledOnce();
    expect(createObjectURL.mock.calls[0][0]).toBeInstanceOf(Blob);
    expect(createObjectURL.mock.calls[0][0].size).toBeGreaterThan(0);
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:generated-secrets');
  });
});
