import { afterEach, beforeEach, describe, it, expect, vi } from 'vitest';
import { act, render, screen, fireEvent, waitFor } from '@testing-library/react';
import PasswordGenerator from '../../src/tools/PasswordGenerator.jsx';
import { loadWordlist } from '../../src/lib/wordlists.js';

const ALPHA = ['alpha-001', 'alpha-002', 'alpha-003', 'alpha-004', 'alpha-005', 'alpha-006'];
const BRAVO = ['bravo-001', 'bravo-002', 'bravo-003', 'bravo-004', 'bravo-005', 'bravo-006'];
const ALPHA_PHRASE = /^alpha-\d{3}(-alpha-\d{3})*$/;
const BRAVO_PHRASE = /^bravo-\d{3}(-bravo-\d{3})*$/;

vi.mock('../../src/lib/wordlists.js', async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, loadWordlist: vi.fn() };
});

function createDeferred() {
  let resolve;
  let reject;
  const promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

function outputText() {
  return document.querySelector('pre.font-mono')?.textContent ?? '';
}

function stubCsvDownload() {
  const createObjectURL = vi.fn(() => 'blob:generated-secrets');
  const revokeObjectURL = vi.fn();
  vi.stubGlobal('URL', { createObjectURL, revokeObjectURL });
  vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
  return { createObjectURL, revokeObjectURL };
}

async function readCsvValues(createObjectURL) {
  expect(createObjectURL).toHaveBeenCalledOnce();
  const blob = createObjectURL.mock.calls[0][0];
  const text = await blob.text();
  return text.split('\r\n').slice(1).map((row) => (
    row.split(',').map((cell) => cell.slice(1, -1))[0]
  ));
}

describe('PasswordGenerator export gating and load races', () => {
  let calls;
  let writeText;

  beforeEach(() => {
    calls = [];
    loadWordlist.mockImplementation((id) => {
      const deferred = createDeferred();
      calls.push({ id, deferred });
      return deferred.promise;
    });
    writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  const lastCallFor = (id) => [...calls].reverse().find((call) => call.id === id);

  it('withholds batch exports while a wordlist load is pending and exports only new-list values after', async () => {
    render(<PasswordGenerator />);
    fireEvent.click(screen.getByText('Passphrase'));
    fireEvent.change(screen.getByLabelText('Generation Count'), { target: { value: '2' } });

    await waitFor(() => expect(loadWordlist).toHaveBeenCalledWith('eff-short'));
    lastCallFor('eff-short').deferred.resolve(ALPHA);
    const table = await screen.findByRole('table', { name: 'Generated passphrase batch' });
    const displayed = Array.from(table.querySelectorAll('tbody code'), (el) => el.textContent);
    expect(displayed).toHaveLength(2);
    displayed.forEach((value) => expect(value).toMatch(ALPHA_PHRASE));

    fireEvent.change(screen.getByLabelText('Wordlist'), { target: { value: 'eff-long' } });
    await waitFor(() => expect(loadWordlist).toHaveBeenCalledWith('eff-long'));

    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Copy All' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Download CSV' })).toBeDisabled();

    lastCallFor('eff-long').deferred.resolve(BRAVO);
    const newTable = await screen.findByRole('table', { name: 'Generated passphrase batch' });
    const newDisplayed = Array.from(newTable.querySelectorAll('tbody code'), (el) => el.textContent);
    expect(newDisplayed).toHaveLength(2);
    newDisplayed.forEach((value) => expect(value).toMatch(BRAVO_PHRASE));

    const { createObjectURL } = stubCsvDownload();
    fireEvent.click(screen.getByRole('button', { name: 'Download CSV' }));
    const csvValues = await readCsvValues(createObjectURL);
    expect(csvValues).toEqual(newDisplayed);
    csvValues.forEach((value) => expect(value).toMatch(BRAVO_PHRASE));

    fireEvent.click(screen.getByRole('button', { name: 'Copy All' }));
    await waitFor(() => expect(writeText).toHaveBeenCalledOnce());
    const copiedValues = writeText.mock.calls[0][0].split('\n');
    expect(copiedValues).toEqual(newDisplayed);
    copiedValues.forEach((value) => expect(value).toMatch(BRAVO_PHRASE));
  });

  it('hides stale single results and withholds copy until the new wordlist loads', async () => {
    render(<PasswordGenerator />);
    fireEvent.click(screen.getByText('Passphrase'));

    await waitFor(() => expect(loadWordlist).toHaveBeenCalledWith('eff-short'));
    lastCallFor('eff-short').deferred.resolve(ALPHA);
    await screen.findByText('Generated Passphrase');
    expect(outputText()).toMatch(ALPHA_PHRASE);

    fireEvent.change(screen.getByLabelText('Wordlist'), { target: { value: 'eff-long' } });
    await waitFor(() => expect(loadWordlist).toHaveBeenCalledWith('eff-long'));

    const copyButton = screen.getByRole('button', { name: 'Copy to Clipboard' });
    expect(copyButton).toBeDisabled();
    expect(outputText()).toBe('');
    expect(screen.queryByText('Generated Passphrase')).not.toBeInTheDocument();
    expect(screen.queryByText('Password Entropy')).not.toBeInTheDocument();
    fireEvent.click(copyButton);
    expect(writeText).not.toHaveBeenCalled();

    lastCallFor('eff-long').deferred.resolve(BRAVO);
    await waitFor(() => expect(outputText()).toMatch(BRAVO_PHRASE));

    const enabledCopy = screen.getByRole('button', { name: 'Copy to Clipboard' });
    expect(enabledCopy).toBeEnabled();
    fireEvent.click(enabledCopy);
    await waitFor(() => expect(writeText).toHaveBeenCalledOnce());
    expect(writeText.mock.calls[0][0]).toBe(outputText());
    expect(writeText.mock.calls[0][0]).toMatch(BRAVO_PHRASE);
  });

  it.each(['resolve', 'reject'])('race: a late Regenerate %s never replaces newer results', async (outcome) => {
    render(<PasswordGenerator />);
    fireEvent.click(screen.getByText('Passphrase'));

    await waitFor(() => expect(loadWordlist).toHaveBeenCalledWith('eff-short'));
    lastCallFor('eff-short').deferred.resolve(ALPHA);
    await screen.findByText('Generated Passphrase');
    expect(outputText()).toMatch(ALPHA_PHRASE);

    fireEvent.click(screen.getByRole('button', { name: 'Regenerate' }));
    await waitFor(() => expect(calls.filter((call) => call.id === 'eff-short')).toHaveLength(2));
    const regenerateCall = lastCallFor('eff-short');

    fireEvent.change(screen.getByLabelText('Wordlist'), { target: { value: 'eff-long' } });
    await waitFor(() => expect(loadWordlist).toHaveBeenCalledWith('eff-long'));

    lastCallFor('eff-long').deferred.resolve(BRAVO);
    await waitFor(() => expect(outputText()).toMatch(BRAVO_PHRASE));
    expect(screen.queryByText(/loading selected wordlist/i)).not.toBeInTheDocument();

    await act(async () => {
      if (outcome === 'resolve') regenerateCall.deferred.resolve(ALPHA);
      else regenerateCall.deferred.reject(new Error('stale failure'));
    });
    expect(outputText()).toMatch(BRAVO_PHRASE);
    expect(screen.queryByText(/loading selected wordlist/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/stale failure/)).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Copy to Clipboard' }));
    await waitFor(() => expect(writeText).toHaveBeenCalledOnce());
    expect(writeText.mock.calls[0][0]).toBe(outputText());
    expect(writeText.mock.calls[0][0]).toMatch(BRAVO_PHRASE);
  });

  it.each(['resolve', 'reject'])('race: a stale %s leaves the newer pending load intact', async (outcome) => {
    render(<PasswordGenerator />);
    fireEvent.click(screen.getByText('Passphrase'));

    await waitFor(() => expect(loadWordlist).toHaveBeenCalledWith('eff-short'));
    lastCallFor('eff-short').deferred.resolve(ALPHA);
    await screen.findByText('Generated Passphrase');
    expect(outputText()).toMatch(ALPHA_PHRASE);

    fireEvent.click(screen.getByRole('button', { name: 'Regenerate' }));
    await waitFor(() => expect(calls.filter((call) => call.id === 'eff-short')).toHaveLength(2));
    const regenerateCall = lastCallFor('eff-short');

    fireEvent.change(screen.getByLabelText('Wordlist'), { target: { value: 'eff-long' } });
    await waitFor(() => expect(loadWordlist).toHaveBeenCalledWith('eff-long'));
    expect(screen.getByRole('button', { name: 'Copy to Clipboard' })).toBeDisabled();

    await act(async () => {
      if (outcome === 'resolve') regenerateCall.deferred.resolve(ALPHA);
      else regenerateCall.deferred.reject(new Error('stale failure'));
    });
    expect(outputText()).toBe('');
    expect(screen.getByText(/loading selected wordlist/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Copy to Clipboard' })).toBeDisabled();
    expect(screen.queryByText(/stale failure/)).not.toBeInTheDocument();

    await act(async () => {
      lastCallFor('eff-long').deferred.reject(new Error('current failure'));
    });
    expect(screen.getByText(/current failure/)).toBeInTheDocument();
    expect(screen.queryByText(/loading selected wordlist/i)).not.toBeInTheDocument();
    expect(outputText()).toBe('');
    expect(screen.getByRole('button', { name: 'Copy to Clipboard' })).toBeDisabled();
    expect(writeText).not.toHaveBeenCalled();
  });
});
