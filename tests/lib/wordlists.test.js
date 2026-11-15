import { describe, expect, it } from 'vitest';
import { EFF_SHORT_WORDLIST } from '../../src/lib/wordlist.js';
import { EFF_LONG_WORDLIST } from '../../src/lib/wordlist-eff-long.js';
import { DICEWARE_WORDLIST } from '../../src/lib/wordlist-diceware.js';
import { loadWordlist } from '../../src/lib/wordlists.js';

describe('passphrase wordlists', () => {
  it.each([
    ['EFF Short 2.0', EFF_SHORT_WORDLIST, 1296],
    ['EFF Long', EFF_LONG_WORDLIST, 7776],
    ['Original Diceware', DICEWARE_WORDLIST, 7776],
  ])('%s has the exact published size and no duplicate entries', (_name, wordlist, expectedSize) => {
    expect(wordlist).toHaveLength(expectedSize);
    expect(new Set(wordlist).size).toBe(expectedSize);
  });

  it('spot-checks EFF Long against canonical dice coordinates', () => {
    expect(EFF_LONG_WORDLIST[0]).toBe('abacus'); // 11111
    expect(EFF_LONG_WORDLIST[310]).toBe('arousal'); // 12345
    expect(EFF_LONG_WORDLIST[7465]).toBe('varnish'); // 65432
    expect(EFF_LONG_WORDLIST[7775]).toBe('zoom'); // 66666
  });

  it('spot-checks Original Diceware against canonical dice coordinates', () => {
    expect(DICEWARE_WORDLIST[0]).toBe('a'); // 11111
    expect(DICEWARE_WORDLIST[310]).toBe('apathy'); // 12345
    expect(DICEWARE_WORDLIST[7465]).toBe('zzz'); // 65432
    expect(DICEWARE_WORDLIST[7775]).toBe('@'); // 66666
  });

  it('loads each list through the public loader', async () => {
    await expect(loadWordlist('eff-short')).resolves.toBe(EFF_SHORT_WORDLIST);
    await expect(loadWordlist('eff-long')).resolves.toBe(EFF_LONG_WORDLIST);
    await expect(loadWordlist('diceware')).resolves.toBe(DICEWARE_WORDLIST);
  });

  it('rejects unknown wordlist IDs', async () => {
    await expect(loadWordlist('unknown')).rejects.toThrow('Unknown wordlist: unknown');
  });
});
