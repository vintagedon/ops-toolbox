/**
 * @file wordlists.js
 * @description Metadata and lazy loaders for passphrase wordlists
 * @author vintagedon
 * @license MIT
 * @see https://github.com/radioastronomyio/ops-toolbox
 */

import { EFF_SHORT_WORDLIST } from './wordlist.js';

export const DEFAULT_WORDLIST_ID = 'eff-short';

export const WORDLIST_OPTIONS = Object.freeze([
  {
    id: DEFAULT_WORDLIST_ID,
    label: 'EFF Short 2.0 (1,296 words)',
    size: 1296,
  },
  {
    id: 'eff-long',
    label: 'EFF Long (7,776 words)',
    size: 7776,
  },
  {
    id: 'diceware',
    label: 'Original Diceware (7,776 entries)',
    size: 7776,
  },
]);

/**
 * Loads a wordlist by ID. The default list is bundled synchronously; larger
 * lists use dynamic imports so Vite emits them as separate on-demand chunks.
 *
 * @param {string} wordlistId - A WORDLIST_OPTIONS ID
 * @returns {Promise<string[]>} Selected wordlist
 */
export async function loadWordlist(wordlistId) {
  switch (wordlistId) {
    case DEFAULT_WORDLIST_ID:
      return EFF_SHORT_WORDLIST;
    case 'eff-long': {
      const { EFF_LONG_WORDLIST } = await import('./wordlist-eff-long.js');
      return EFF_LONG_WORDLIST;
    }
    case 'diceware': {
      const { DICEWARE_WORDLIST } = await import('./wordlist-diceware.js');
      return DICEWARE_WORDLIST;
    }
    default:
      throw new Error(`Unknown wordlist: ${wordlistId}`);
  }
}
