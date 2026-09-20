/**
 * @file password.js
 * @description Cryptographic password and passphrase generation using Web Crypto API with rejection sampling
 * @author vintagedon
 * @license MIT
 * @see https://github.com/radioastronomyio/ops-toolbox
 */

import { EFF_SHORT_WORDLIST } from './wordlist.js';

/**
 * Character pools for password generation
 */
const POOLS = {
  uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  lowercase: 'abcdefghijklmnopqrstuvwxyz',
  numeric: '0123456789',
  special: '!@#$%^&*()_+-={}|;:,.<>?'
};

/**
 * Selects uniformly random characters from a string using byte rejection sampling.
 *
 * @param {number} length - Number of characters to select
 * @param {string} charset - Source character pool
 * @returns {string} Random characters
 */
function generateRandomCharacters(length, charset) {
  const poolSize = charset.length;
  const maxValid = 256 - (256 % poolSize);

  let result = '';
  while (result.length < length) {
    const randomValues = window.crypto.getRandomValues(new Uint8Array(Math.max(length * 2, 1)));
    for (let i = 0; i < randomValues.length && result.length < length; i++) {
      if (randomValues[i] < maxValid) {
        result += charset[randomValues[i] % poolSize];
      }
    }
  }

  return result;
}

/**
 * Generates a random password using Web Crypto API
 * @param {number} length - Desired password length
 * @param {object} options - { uppercase, lowercase, numeric, special } booleans
 * @returns {string} Generated password
 */
export function generatePassword(length, options) {
  const charset = buildCharset(options);
  if (!charset) {
    throw new Error('At least one character set must be enabled');
  }
  return generateRandomCharacters(length, charset);
}

/**
 * Calculates the entropy of a password in bits
 * @param {number} length - Password length
 * @param {number} poolSize - Number of possible characters in the pool
 * @returns {number} Entropy in bits
 */
export function calculateEntropy(length, poolSize) {
  if (length === 0 || !poolSize) return 0;
  return Math.floor(length * Math.log2(poolSize));
}

/**
 * Generate a passphrase by picking random words via rejection sampling.
 *
 * @param {number} wordCount - Number of words to generate
 * @param {string} separator - Text placed between words
 * @param {boolean} capitalize - Whether to capitalize each selected word
 * @param {string[]} wordlist - Source list; defaults to EFF Short 2.0
 * @param {number} paddingDigits - Uniformly random digits to append
 * @returns {string} Generated passphrase
 */
export function generatePassphrase(
  wordCount,
  separator = '-',
  capitalize = false,
  wordlist = EFF_SHORT_WORDLIST,
  paddingDigits = 0,
) {
  if (!Array.isArray(wordlist) || wordlist.length === 0) {
    throw new Error('A non-empty wordlist is required');
  }
  if (!Number.isInteger(paddingDigits) || paddingDigits < 0) {
    throw new Error('Padding digit count must be a non-negative integer');
  }

  const poolSize = wordlist.length;
  // Same rejection sampling as generatePassword, but over Uint32 range (4294967296 = 2^32)
  const maxValid = 4294967296 - (4294967296 % poolSize);

  const words = [];
  while (words.length < wordCount) {
    const randomValues = window.crypto.getRandomValues(new Uint32Array(wordCount * 2));
    for (let i = 0; i < randomValues.length && words.length < wordCount; i++) {
      if (randomValues[i] < maxValid) {
        let word = wordlist[randomValues[i] % poolSize];
        if (capitalize) word = word.charAt(0).toUpperCase() + word.slice(1);
        words.push(word);
      }
    }
  }

  const phrase = words.join(separator);
  return phrase + generateRandomCharacters(paddingDigits, POOLS.numeric);
}

/**
 * Calculates passphrase entropy, including uniformly random numeric padding.
 *
 * @param {number} wordCount - Number of independently selected words
 * @param {number} wordlistSize - Number of entries in the selected wordlist
 * @param {number} paddingDigits - Number of independently selected base-10 digits
 * @returns {number} Whole entropy bits, rounded down for display
 */
export function calculatePassphraseEntropy(wordCount, wordlistSize, paddingDigits = 0) {
  if (wordCount === 0 || !wordlistSize) return 0;
  return Math.floor((wordCount * Math.log2(wordlistSize)) + (paddingDigits * Math.log2(10)));
}

/**
 * Generates a batch while rejecting duplicate values.
 *
 * @param {number} count - Number of distinct results requested
 * @param {() => string} generateValue - Cryptographic value generator
 * @param {number|((value: string) => number)} entropyForValue - Entropy value or calculator
 * @returns {{value: string, entropy: number}[]} Generated rows
 */
export function generateBatch(count, generateValue, entropyForValue) {
  if (!Number.isInteger(count) || count < 1) {
    throw new Error('Batch count must be a positive integer');
  }
  if (typeof generateValue !== 'function') {
    throw new Error('Batch generation requires a value generator');
  }

  const results = [];
  const seen = new Set();
  const maxAttempts = Math.max(100, count * 100);
  let attempts = 0;

  while (results.length < count && attempts < maxAttempts) {
    const value = generateValue();
    attempts += 1;
    if (seen.has(value)) continue;

    seen.add(value);
    results.push({
      value,
      entropy: typeof entropyForValue === 'function' ? entropyForValue(value) : entropyForValue,
    });
  }

  if (results.length !== count) {
    throw new Error('Unable to generate the requested number of distinct values');
  }

  return results;
}

/**
 * Builds a character set from options
 * @param {object} options - { uppercase, lowercase, numeric, special } booleans
 * @returns {string} Concatenated character set string, or null if all disabled
 */
export function buildCharset(options) {
  if (!options.uppercase && !options.lowercase && !options.numeric && !options.special) {
    return null;
  }

  let charset = '';
  if (options.uppercase) charset += POOLS.uppercase;
  if (options.lowercase) charset += POOLS.lowercase;
  if (options.numeric) charset += POOLS.numeric;
  if (options.special) charset += POOLS.special;

  return charset;
}
