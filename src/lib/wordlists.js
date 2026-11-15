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

export const SEPARATOR_OPTIONS = Object.freeze([
  { label: 'Hyphen (-)', value: '-' },
  { label: 'Dot (.)', value: '.' },
  { label: 'Underscore (_)', value: '_' },
  { label: 'Space ( )', value: ' ' },
  { label: 'None', value: '' },
]);

// Word counts the tool offers; the slider range and the decodability invariant both use it.
export const MIN_WORD_COUNT = 3;
export const MAX_WORD_COUNT = 12;

export const WITHDRAWN_SEPARATOR_REASON = 'different word sequences could produce identical output';

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

/**
 * Suffix of `candidate` left over when `prefixCandidate` is removed, for strict prefixes.
 *
 * @param {string} prefixCandidate - Potential prefix
 * @param {string} candidate - String to test against
 * @returns {string|null} Remainder, or null when there is no strict-prefix relation
 */
function strictQuotient(prefixCandidate, candidate) {
  return prefixCandidate.length < candidate.length && candidate.startsWith(prefixCandidate)
    ? candidate.slice(prefixCandidate.length)
    : null;
}

/**
 * Finds every strict-prefix pair in a codeword set. Scans the lexicographically
 * sorted set so each prefix only visits its own contiguous extension block,
 * instead of comparing all pairs.
 *
 * @param {string[]} code - Unique codewords
 * @returns {[string, string][]} Pairs [prefix, extended], one per strict-prefix relation
 */
function findPrefixPairs(code) {
  const sorted = [...code].sort();
  const pairs = [];
  for (let i = 0; i < sorted.length; i += 1) {
    const prefix = sorted[i];
    for (let j = i + 1; j < sorted.length && sorted[j].startsWith(prefix); j += 1) {
      pairs.push([prefix, sorted[j]]);
    }
  }
  return pairs;
}

/**
 * Decides unique decodability of a set of codewords with the Sardinas-Patterson test.
 * Unique decodability means every concatenation of codewords maps back to exactly
 * one codeword sequence, which is what the passphrase entropy formula assumes.
 *
 * @param {string[]} codewords - Candidate codewords (a rendered word plus its trailing separator)
 * @returns {boolean} True when every concatenation decodes to exactly one sequence
 */
export function isUniquelyDecodable(codewords) {
  const code = [...new Set(codewords)];
  if (code.length === 0 || code.some((word) => word.length === 0)) {
    return false;
  }

  const residuals = new Set();
  for (const [a, b] of findPrefixPairs(code)) {
    residuals.add(b.slice(a.length));
  }

  const seen = new Set();
  while (residuals.size > 0) {
    for (const word of code) {
      if (residuals.has(word)) return false;
    }
    for (const residual of residuals) seen.add(residual);
    const next = new Set();
    for (const residual of residuals) {
      for (const word of code) {
        const fromResidual = strictQuotient(residual, word);
        if (fromResidual !== null && !seen.has(fromResidual)) next.add(fromResidual);
        const fromWord = strictQuotient(word, residual);
        if (fromWord !== null && !seen.has(fromWord)) next.add(fromWord);
      }
    }
    residuals.clear();
    for (const residual of next) residuals.add(residual);
  }
  return true;
}

/**
 * Renders one list entry as it appears inside a generated passphrase.
 *
 * @param {string} word - Raw list entry
 * @param {boolean} capitalize - Whether the tool capitalizes each word
 * @returns {string} Rendered word
 */
export function renderPassphraseWord(word, capitalize) {
  return capitalize ? word.charAt(0).toUpperCase() + word.slice(1) : word;
}

/**
 * Builds the codeword set a combination actually renders: each entry as it
 * renders, followed by the separator.
 *
 * @param {string[]} wordlist - Source list
 * @param {string} separator - Separator placed after every word
 * @param {boolean} capitalize - Whether the tool capitalizes each word
 * @returns {string[]} Codewords for the combination
 */
export function combinationCodewords(wordlist, separator, capitalize) {
  return wordlist.map((word) => renderPassphraseWord(word, capitalize) + separator);
}

/**
 * Searches for a witness pair: two different word sequences whose rendered
 * output is identical, with both sequences at offered word counts. Uses the
 * Sardinas-Patterson residual chain to build the pair. Equal-length closures
 * are preferred; both sequences always receive the same number of filler
 * codewords, which keeps the rendered outputs identical.
 *
 * @param {string[]} wordlist - Source list
 * @param {string} separator - Separator placed after every word
 * @param {boolean} capitalize - Whether the tool capitalizes each word
 * @param {number} [minCount] - Shortest offered word count
 * @param {number} [maxCount] - Longest offered word count
 * @returns {{sequenceA: string[], sequenceB: string[], output: string, wordCountA: number, wordCountB: number}|null} Witness, or null
 */
export function findCollisionWitness(wordlist, separator, capitalize, minCount = MIN_WORD_COUNT, maxCount = MAX_WORD_COUNT) {
  const code = [...new Set(combinationCodewords(wordlist, separator, capitalize))];
  const codeSet = new Set(code);
  const filler = code[0];

  const padWitness = (seqA, seqB) => {
    const fillers = Math.max(0, minCount - Math.min(seqA.length, seqB.length));
    const paddedA = [...seqA, ...Array(fillers).fill(filler)];
    const paddedB = [...seqB, ...Array(fillers).fill(filler)];
    if (paddedA.length > maxCount || paddedB.length > maxCount) return null;
    return {
      sequenceA: paddedA,
      sequenceB: paddedB,
      output: paddedA.join(''),
      wordCountA: paddedA.length,
      wordCountB: paddedB.length,
    };
  };

  // Frontier entries satisfy join(seqA) === join(seqB) + residual.
  let frontier = findPrefixPairs(code).map(([a, b]) => ({ residual: b.slice(a.length), seqA: [b], seqB: [a] }));
  let fallback = null;

  const seen = new Set();
  while (frontier.length > 0) {
    const nextFrontier = [];
    for (const { residual, seqA, seqB } of frontier) {
      const closed = residual === '' ? seqB : codeSet.has(residual) ? [...seqB, residual] : null;
      if (closed) {
        if (closed.length === seqA.length) {
          const witness = padWitness(seqA, closed);
          if (witness) return witness;
        } else if (!fallback) {
          fallback = [seqA, closed];
        }
      }
      if (residual === '') continue;
      if (seen.has(residual)) continue;
      seen.add(residual);
      for (const word of code) {
        // Word is a strict prefix of the residual: seqB absorbs it, residual shrinks.
        const residualRest = strictQuotient(word, residual);
        if (residualRest !== null) {
          nextFrontier.push({ residual: residualRest, seqA, seqB: [...seqB, word] });
          continue;
        }
        // Residual is a strict prefix of the word: seqB overshoots seqA, roles swap.
        const wordRest = strictQuotient(residual, word);
        if (wordRest !== null) {
          nextFrontier.push({ residual: wordRest, seqA: [...seqB, word], seqB: seqA });
        }
      }
    }
    frontier = nextFrontier;
  }

  if (fallback) {
    return padWitness(fallback[0], fallback[1]);
  }
  return null;
}

/**
 * Evaluates which separators the tool may offer for a list and capitalization.
 * A separator is available only when the rendered codeword set is uniquely
 * decodable, so any output maps back to exactly one word sequence.
 * Results are cached per list object and capitalization; the check over a
 * 7,776-entry list is too costly to rerun on every generation.
 *
 * @param {string[]} wordlist - Source list
 * @param {boolean} capitalize - Whether the tool capitalizes each word
 * @returns {{label: string, value: string, available: boolean, reason: string|null}[]} Separator options with availability
 */
const separatorPolicyCache = new WeakMap();

export function evaluateSeparatorPolicy(wordlist, capitalize) {
  const key = capitalize ? 'capitalized' : 'plain';
  let perList = separatorPolicyCache.get(wordlist);
  if (!perList) {
    perList = new Map();
    separatorPolicyCache.set(wordlist, perList);
  }
  if (!perList.has(key)) {
    perList.set(key, SEPARATOR_OPTIONS.map((option) => {
      const available = isUniquelyDecodable(combinationCodewords(wordlist, option.value, capitalize));
      return { ...option, available, reason: available ? null : WITHDRAWN_SEPARATOR_REASON };
    }));
  }
  return perList.get(key);
}
