/**
 * @file AsciiBanner.test.jsx
 * @description Banner UI, request ordering and state-setter checks after unmount
 * @license MIT
 * @see https://github.com/vintagedon/ops-toolbox
 */
import { afterEach, beforeEach, describe, it, expect, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import * as bannerLibrary from '../../src/lib/asciiBanner.js';
import AsciiBanner from '../../src/tools/AsciiBanner.jsx';

const stateProbe = vi.hoisted(() => ({ unmounted: false, calls: vi.fn() }));

// React 18 ignores state updates after unmount. Observe setter entry directly
// so U1/U2 detect the bug without relying on a console warning or jsdom teardown.
vi.mock('react', async importOriginal => {
  const actual = await importOriginal();
  return {
    ...actual,
    useState(initial) {
      const [value, setValue] = actual.useState(initial);
      const trackedSetter = actual.useCallback(next => {
        if (stateProbe.unmounted) stateProbe.calls(next);
        return setValue(next);
      }, [setValue]);
      return [value, trackedSetter];
    },
  };
});

describe('AsciiBanner', () => {
  it('renders without crashing', () => {
    render(<AsciiBanner />);
    expect(screen.getByText('ASCII Banner')).toBeInTheDocument();
  });

  it('text input field is present', () => {
    render(<AsciiBanner />);
    expect(screen.getByPlaceholderText('Hello World')).toBeInTheDocument();
  });

  it('font selector dropdown is present', () => {
    render(<AsciiBanner />);
    const selects = screen.getAllByRole('combobox');
    expect(selects.length).toBeGreaterThanOrEqual(1);
  });

  it('preset font buttons rendered', () => {
    render(<AsciiBanner />);
    // Preset buttons may share text with dropdown options; use getAllByText
    expect(screen.getAllByText('Standard').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Big').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Slant').length).toBeGreaterThanOrEqual(1);
  });

  it('Copy button present', () => {
    render(<AsciiBanner />);
    expect(screen.getByText(/Copy/)).toBeInTheDocument();
  });

  it('Download button present', () => {
    render(<AsciiBanner />);
    expect(screen.getByText(/Download/)).toBeInTheDocument();
  });

  it('output pre block present', () => {
    render(<AsciiBanner />);
    expect(document.querySelector('pre')).toBeInTheDocument();
  });
});

describe('AsciiBanner request lifetime', () => {
  let requests;

  beforeEach(() => {
    vi.useFakeTimers();
    stateProbe.unmounted = false;
    stateProbe.calls.mockClear();
    requests = [];
    vi.spyOn(bannerLibrary, 'generateBanner').mockImplementation(text => {
      if (!text) return Promise.resolve('');
      return new Promise((resolve, reject) => requests.push({ text, resolve, reject }));
    });
  });

  afterEach(async () => {
    cleanup();
    await act(async () => { requests.forEach(request => request.resolve('')); });
    stateProbe.unmounted = false;
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  async function request(text) {
    fireEvent.change(screen.getByPlaceholderText('Hello World'), { target: { value: text } });
    await act(async () => { vi.advanceTimersByTime(300); });
    expect(requests.at(-1).text).toBe(text);
    return requests.at(-1);
  }

  it('A1: keeps R2 when R1 resolves after it', async () => {
    render(<AsciiBanner />);
    const r1 = await request('one');
    const r2 = await request('two');
    await act(async () => { r2.resolve('banner TWO'); });
    expect(document.querySelector('pre')).toHaveTextContent('banner TWO');
    await act(async () => { r1.resolve('banner ONE'); });
    expect(document.querySelector('pre')).toHaveTextContent('banner TWO');
  });

  it('A2: keeps R2 when R1 rejects after it', async () => {
    render(<AsciiBanner />);
    const r1 = await request('one');
    const r2 = await request('two');
    await act(async () => { r2.resolve('banner TWO'); });
    expect(document.querySelector('pre')).toHaveTextContent('banner TWO');
    await act(async () => { r1.reject(new Error('old request failed')); });
    expect(document.querySelector('pre')).toHaveTextContent('banner TWO');
  });

  it('U1: never calls a state setter when the latest request resolves after unmount', async () => {
    const { unmount } = render(<AsciiBanner />);
    const latest = await request('one');
    unmount();
    stateProbe.unmounted = true;
    await act(async () => { latest.resolve('unmounted banner'); });
    expect(stateProbe.calls).not.toHaveBeenCalled();
  });

  it('U2: never calls a state setter when the latest request rejects after unmount', async () => {
    const { unmount } = render(<AsciiBanner />);
    const latest = await request('one');
    unmount();
    stateProbe.unmounted = true;
    await act(async () => { latest.reject(new Error('unmounted request failed')); });
    expect(stateProbe.calls).not.toHaveBeenCalled();
  });
});
