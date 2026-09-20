import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { generatePassword, calculateEntropy, buildCharset, generatePassphrase, calculatePassphraseEntropy, generateBatch } from '../../src/lib/password.js';
import { EFF_SHORT_WORDLIST } from '../../src/lib/wordlist.js';

describe('Password Generator', () => {
  beforeEach(() => {
    // Mock crypto.getRandomValues for testing
    vi.stubGlobal('crypto', {
      getRandomValues: (typedArray) => {
        for (let i = 0; i < typedArray.length; i++) {
          typedArray[i] = i;
        }
        return typedArray;
      }
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('generatePassword', () => {
    it('generates password of requested length', () => {
      const password = generatePassword(8, {
        uppercase: true,
        lowercase: false,
        numeric: false,
        special: false
      });

      expect(password).toHaveLength(8);
      expect(password).toMatch(/^[A-Z]+$/); // All uppercase
    });

    it('generates password with mixed character sets', () => {
      const password = generatePassword(16, {
        uppercase: true,
        lowercase: true,
        numeric: true,
        special: false
      });

      expect(password).toHaveLength(16);
      expect(password).toMatch(/^[A-Za-z0-9]+$/); // Mixed uppercase, lowercase, and numbers
    });

    it('generates password with only special characters', () => {
      const password = generatePassword(12, {
        uppercase: false,
        lowercase: false,
        numeric: false,
        special: true
      });

      expect(password).toHaveLength(12);
      expect(password).toMatch(/^[!@#$%^&*()_+\-={}|;:,.<>?]+$/); // Only special characters
    });
  });

  describe('calculateEntropy', () => {
    it('calculates entropy correctly', () => {
      const password = generatePassword(16, {
        uppercase: true,
        lowercase: true,
        numeric: true,
        special: true
      });
      const charset = buildCharset({
        uppercase: true,
        lowercase: true,
        numeric: true,
        special: true
      });
      const entropy = calculateEntropy(password.length, charset.length);

      expect(entropy).toBe(102); // 16 * log2(86) = 102.9... floored to 102
    });

    it('calculates entropy for different charset sizes', () => {
      // Uppercase only: 26 chars
      const entropy1 = calculateEntropy(26, buildCharset({ uppercase: true }).length);
      expect(entropy1).toBeCloseTo(122, 0); // ~122 bits (26 * log2(26))

      // Uppercase + lowercase: 52 chars
      const entropy2 = calculateEntropy(52, buildCharset({ uppercase: true, lowercase: true }).length);
      expect(entropy2).toBeCloseTo(296, 0); // ~296 bits (52 * log2(52))

      // Uppercase + lowercase + numeric: 62 chars
      const entropy3 = calculateEntropy(62, buildCharset({ uppercase: true, lowercase: true, numeric: true }).length);
      expect(entropy3).toBeCloseTo(369, 0); // ~369 bits (62 * log2(62))

      // All four pools: 86 chars
      const entropy4 = calculateEntropy(95, buildCharset({
        uppercase: true,
        lowercase: true,
        numeric: true,
        special: true
      }).length);
      expect(entropy4).toBeCloseTo(610, 0); // ~610 bits (95 * log2(86))
    });
  });

  describe('calculateEntropy (poolSize as number)', () => {
    it('calculateEntropy(24, 86) → 154', () => {
      expect(calculateEntropy(24, 86)).toBe(154);
    });

    it('calculateEntropy(8, 26) → 37', () => {
      expect(calculateEntropy(8, 26)).toBe(37);
    });

    it('calculateEntropy(0, 86) → 0', () => {
      expect(calculateEntropy(0, 86)).toBe(0);
    });

    it('calculateEntropy(24, 0) → 0', () => {
      expect(calculateEntropy(24, 0)).toBe(0);
    });
  });

  describe('buildCharset', () => {
    it('buildCharset returns correct character sets', () => {
      const charset1 = buildCharset({ uppercase: true });
      expect(charset1).toBe('ABCDEFGHIJKLMNOPQRSTUVWXYZ');
      expect(charset1).toHaveLength(26);

      const charset2 = buildCharset({ lowercase: true });
      expect(charset2).toBe('abcdefghijklmnopqrstuvwxyz');
      expect(charset2).toHaveLength(26);

      const charset3 = buildCharset({ numeric: true });
      expect(charset3).toBe('0123456789');
      expect(charset3).toHaveLength(10);

      const charset4 = buildCharset({ special: true });
      expect(charset4).toBe('!@#$%^&*()_+-={}|;:,.<>?');
      expect(charset4).toHaveLength(24);

      const charsetMixed = buildCharset({
        uppercase: true,
        lowercase: true,
        numeric: true,
        special: true
      });
      expect(charsetMixed).toHaveLength(86); // 26 + 26 + 10 + 24
    });
  });
});

describe('generatePassphrase', () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });
  it('returns string with correct number of words split by default separator', () => {
    const result = generatePassphrase(6);
    expect(result.split('-')).toHaveLength(6);
  });

  it('default separator is hyphen', () => {
    const result = generatePassphrase(4);
    const parts = result.split('-');
    expect(parts).toHaveLength(4);
  });

  it('capitalize option capitalizes first letter of each word', () => {
    const result = generatePassphrase(4, '-', true);
    const words = result.split('-');
    words.forEach(word => {
      expect(word[0]).toBe(word[0].toUpperCase());
    });
  });

  it('custom separator works', () => {
    const result = generatePassphrase(3, '.');
    expect(result.split('.')).toHaveLength(3);
  });

  it('uses the supplied wordlist', () => {
    const wordlist = ['alpha', 'bravo'];
    const result = generatePassphrase(4, '-', false, wordlist);
    expect(result.split('-')).toHaveLength(4);
    result.split('-').forEach((word) => expect(wordlist).toContain(word));
  });

  it('rejects an empty supplied wordlist', () => {
    expect(() => generatePassphrase(4, '-', false, [])).toThrow('A non-empty wordlist is required');
  });

  it('appends the requested number of numeric padding digits', () => {
    const result = generatePassphrase(3, '-', false, ['alpha'], 4);
    expect(result).toMatch(/^alpha-alpha-alpha\d{4}$/);
  });

  it('draws numeric padding from Web Crypto', () => {
    const getRandomValues = vi.spyOn(window.crypto, 'getRandomValues');
    generatePassphrase(3, '-', false, ['alpha'], 2);
    expect(getRandomValues).toHaveBeenCalledWith(expect.any(Uint8Array));
  });

  it('rejects invalid numeric padding counts', () => {
    expect(() => generatePassphrase(3, '-', false, ['alpha'], -1)).toThrow('Padding digit count must be a non-negative integer');
    expect(() => generatePassphrase(3, '-', false, ['alpha'], 1.5)).toThrow('Padding digit count must be a non-negative integer');
  });

  it('two consecutive calls produce different results', () => {
    const a = generatePassphrase(6);
    const b = generatePassphrase(6);
    expect(a).not.toBe(b);
  });
});

describe('calculatePassphraseEntropy', () => {
  it('wordCount=6, wordlistSize=1296 → 62', () => {
    expect(calculatePassphraseEntropy(6, 1296)).toBe(62);
  });

  it('wordCount=8, wordlistSize=1296 → 82', () => {
    expect(calculatePassphraseEntropy(8, 1296)).toBe(82);
  });

  it('uses the selected wordlist size', () => {
    expect(calculatePassphraseEntropy(6, 7776)).toBe(77);
    expect(calculatePassphraseEntropy(6, 7776)).toBeGreaterThan(calculatePassphraseEntropy(6, 1296));
  });

  it('adds digit entropy as digitCount × log2(10) before rounding', () => {
    const paddedEntropy = calculatePassphraseEntropy(6, 1296, 3);
    const expectedEntropy = Math.floor((6 * Math.log2(1296)) + (3 * Math.log2(10)));
    expect(paddedEntropy).toBe(expectedEntropy);
    expect(paddedEntropy).toBe(72);
  });

  it('wordCount=0 → 0', () => {
    expect(calculatePassphraseEntropy(0, 1296)).toBe(0);
  });
});

describe('generateBatch', () => {
  it('returns the requested number of distinct values with per-row entropy', () => {
    const candidates = ['alpha', 'alpha', 'bravo', 'charlie'];
    const results = generateBatch(3, () => candidates.shift(), (value) => value.length);

    expect(results).toEqual([
      { value: 'alpha', entropy: 5 },
      { value: 'bravo', entropy: 5 },
      { value: 'charlie', entropy: 7 },
    ]);
  });

  it('accepts a fixed entropy value', () => {
    let index = 0;
    expect(generateBatch(2, () => `value-${index++}`, 72)).toEqual([
      { value: 'value-0', entropy: 72 },
      { value: 'value-1', entropy: 72 },
    ]);
  });

  it('validates count and generator inputs', () => {
    expect(() => generateBatch(0, () => 'value', 1)).toThrow('Batch count must be a positive integer');
    expect(() => generateBatch(1.5, () => 'value', 1)).toThrow('Batch count must be a positive integer');
    expect(() => generateBatch(1, null, 1)).toThrow('Batch generation requires a value generator');
  });

  it('fails safely when a generator cannot produce enough distinct values', () => {
    expect(() => generateBatch(2, () => 'same', 1)).toThrow('Unable to generate the requested number of distinct values');
  });
});

describe('generatePassword — rejection sampling', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it.each([8, 16, 32, 64])('generates a password of length %i', (length) => {
    const password = generatePassword(length, { uppercase: true, lowercase: true, numeric: true, special: true });
    expect(password).toHaveLength(length);
  });

  it('all characters in output are from the selected charset', () => {
    const options = { uppercase: true, lowercase: true, numeric: true, special: false };
    const charset = buildCharset(options);
    const password = generatePassword(32, options);
    for (const ch of password) {
      expect(charset).toContain(ch);
    }
  });

  it('throws if no character set is enabled', () => {
    expect(() => generatePassword(8, { uppercase: false, lowercase: false, numeric: false, special: false })).toThrow('At least one character set must be enabled');
  });

  it('two consecutive calls produce different results', () => {
    const results = Array.from({ length: 10 }, () =>
      generatePassword(16, { uppercase: true, lowercase: true, numeric: true, special: true })
    );
    const unique = new Set(results);
    expect(unique.size).toBeGreaterThan(1);
  });

  it('works with a single character set enabled (lowercase only)', () => {
    const options = { uppercase: false, lowercase: true, numeric: false, special: false };
    const charset = buildCharset(options);
    const password = generatePassword(20, options);
    expect(password).toHaveLength(20);
    for (const ch of password) {
      expect(charset).toContain(ch);
    }
  });
});

describe('generatePassphrase — rejection sampling', () => {
  it('generates correct number of words split by separator', () => {
    const result = generatePassphrase(6);
    expect(result.split('-')).toHaveLength(6);
  });

  it('all words in output exist in EFF_SHORT_WORDLIST', () => {
    const result = generatePassphrase(8);
    const words = result.split('-');
    for (const word of words) {
      expect(EFF_SHORT_WORDLIST).toContain(word);
    }
  });

  it('default separator is hyphen', () => {
    const result = generatePassphrase(4);
    expect(result.split('-')).toHaveLength(4);
  });

  it('capitalize option capitalizes first letter of each word', () => {
    const result = generatePassphrase(4, '-', true);
    const words = result.split('-');
    for (const word of words) {
      expect(word[0]).toBe(word[0].toUpperCase());
    }
  });

  it('custom separator works', () => {
    const result = generatePassphrase(3, '.');
    expect(result.split('.')).toHaveLength(3);
  });

  it('two consecutive calls produce different results', () => {
    const results = Array.from({ length: 10 }, () => generatePassphrase(6));
    const unique = new Set(results);
    expect(unique.size).toBeGreaterThan(1);
  });
});

describe('generatePassword — distribution uniformity', () => {
  it('distributes lowercase letters roughly uniformly over 10000 samples', () => {
    const options = { uppercase: false, lowercase: true, numeric: false, special: false };
    const counts = {};
    for (let i = 0; i < 10000; i++) {
      const ch = generatePassword(1, options);
      counts[ch] = (counts[ch] || 0) + 1;
    }
    for (const count of Object.values(counts)) {
      expect(count / 10000).toBeGreaterThan(0.01);
      expect(count / 10000).toBeLessThan(0.15);
    }
  });
});
