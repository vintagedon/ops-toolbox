import { describe, expect, it } from 'vitest';
import { serializeSecretBatchCsv } from '../../src/lib/secretBatch.js';

describe('serializeSecretBatchCsv', () => {
  it('includes value and entropy columns with rows in table order', () => {
    const csv = serializeSecretBatchCsv([
      { value: 'alpha-bravo', entropy: 62 },
      { value: 'charlie-delta', entropy: 77 },
    ]);

    expect(csv).toBe([
      'Value,Entropy (bits)',
      '"alpha-bravo","62"',
      '"charlie-delta","77"',
    ].join('\r\n'));
  });

  it('escapes commas and quotes in generated values', () => {
    const csv = serializeSecretBatchCsv([{ value: 'comma,"quote"', entropy: 80 }]);
    expect(csv).toContain('"comma,""quote""","80"');
  });

  it('returns a header-only CSV for an empty batch', () => {
    expect(serializeSecretBatchCsv([])).toBe('Value,Entropy (bits)');
  });
});
