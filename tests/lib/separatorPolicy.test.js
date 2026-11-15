import { describe, expect, it } from 'vitest';
import { DICEWARE_WORDLIST } from '../../src/lib/wordlist-diceware.js';
import {
  MAX_WORD_COUNT,
  MIN_WORD_COUNT,
  SEPARATOR_OPTIONS,
  WORDLIST_OPTIONS,
  combinationCodewords,
  evaluateSeparatorPolicy,
  findCollisionWitness,
  isUniquelyDecodable,
  loadWordlist,
  renderPassphraseWord,
} from '../../src/lib/wordlists.js';

const OFFERED_WORD_COUNTS = Array.from(
  { length: MAX_WORD_COUNT - MIN_WORD_COUNT + 1 },
  (_, index) => MIN_WORD_COUNT + index,
);

describe('separator decodability', () => {
  it('shows the Diceware empty-separator collision renders two sequences identically', () => {
    const render = (words) => words.map((word) => renderPassphraseWord(word, false)).join('');
    const sequenceA = ['a', 'ba', 'a'];
    const sequenceB = ['ab', 'a', 'a'];
    for (const word of [...sequenceA, ...sequenceB]) {
      expect(DICEWARE_WORDLIST).toContain(word);
    }
    expect(render(sequenceA)).toBe('abaa');
    expect(render(sequenceB)).toBe('abaa');
    expect(isUniquelyDecodable(combinationCodewords(DICEWARE_WORDLIST, '', false))).toBe(false);
  });

  it('reports a constructed list with a known collision as not uniquely decodable', () => {
    expect(isUniquelyDecodable(['a', 'ab', 'b'])).toBe(false);
    expect(isUniquelyDecodable(['ab', 'a', 'b'])).toBe(false);
  });

  it('reports a list whose words contain the separator but is uniquely decodable as decodable', () => {
    expect(isUniquelyDecodable(['drop-down', 't-shirt', 'felt-tip', 'yo-yo', 'a', 'c'])).toBe(true);
  });

  it('treats an empty codeword as not uniquely decodable', () => {
    expect(isUniquelyDecodable(['a', ''])).toBe(false);
  });
});

describe('offered separator policy over the tool option data', () => {
  const expectedWithdrawn = [
    { listId: 'diceware', capitalize: false, separatorValue: '.' },
    { listId: 'diceware', capitalize: false, separatorValue: '' },
    { listId: 'diceware', capitalize: true, separatorValue: '' },
  ];

  const isWithdrawn = (listId, capitalize, separatorValue) => expectedWithdrawn.some((entry) => (
    entry.listId === listId
    && entry.capitalize === capitalize
    && entry.separatorValue === separatorValue
  ));

  it.each(WORDLIST_OPTIONS.map((option) => [option.id, option]))(
    '$0 marks exactly the known withdrawn combinations and no others',
    async (listId) => {
      const wordlist = await loadWordlist(listId);
      for (const capitalize of [false, true]) {
        const policy = evaluateSeparatorPolicy(wordlist, capitalize);
        expect(policy.map((row) => row.value)).toEqual(SEPARATOR_OPTIONS.map((option) => option.value));
        for (const row of policy) {
          expect(row.available).toBe(!isWithdrawn(listId, capitalize, row.value));
          expect(row.reason).toBe(row.available ? null : 'different word sequences could produce identical output');
        }
      }
    },
  );

  it.each(WORDLIST_OPTIONS.map((option) => [option.id, option]))(
    '$0 offers no available combination for which a collision witness exists at an offered word count',
    async (listId) => {
      const wordlist = await loadWordlist(listId);
      for (const capitalize of [false, true]) {
        for (const row of evaluateSeparatorPolicy(wordlist, capitalize)) {
          if (!row.available) continue;
          expect(findCollisionWitness(wordlist, row.value, capitalize)).toBeNull();
        }
      }
    },
  );

  it.each(expectedWithdrawn.map((entry) => [entry]))(
    'pairs every withdrawn combination with a witness at an offered word count (%j)',
    async (entry) => {
      const wordlist = await loadWordlist(entry.listId);
      const witness = findCollisionWitness(wordlist, entry.separatorValue, entry.capitalize);
      expect(witness).not.toBeNull();
      expect(OFFERED_WORD_COUNTS).toContain(witness.wordCountA);
      expect(OFFERED_WORD_COUNTS).toContain(witness.wordCountB);
      expect(witness.sequenceA).not.toEqual(witness.sequenceB);
      expect(witness.sequenceA.join('')).toBe(witness.output);
      expect(witness.sequenceB.join('')).toBe(witness.output);
    },
  );
});
