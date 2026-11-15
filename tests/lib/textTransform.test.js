/**
 * @file textTransform.test.js
 * @description Frozen spec 1.2 fixtures and ordered operation contracts
 * @license MIT
 * @see https://github.com/vintagedon/ops-toolbox
 */
import { describe, it, expect } from 'vitest';
import { transformText, parseText, createOperation } from '../../src/lib/textTransform.js';

const op = (type, options = {}) => ({ ...createOperation(type, type), ...options });
const run = (input, ...operations) => transformText(input, operations).text;
const fixtures = [
  ['F1', 'a\n\n\n\nb', 'a\n\nb', 'a\nb'],
  ['F2', 'a\n \t\n\u00A0\n\u200B\n\uFEFF\nb', 'a\n\nb', 'a\nb'],
  ['F3', '\n\n a\n\nb  \n\n\n', ' a\n\nb  \n', ' a\nb  \n'],
  ['F4', 'a\r\n\r\n\r\nb\r\n', 'a\r\n\r\nb\r\n', 'a\r\nb\r\n'],
  ['F5', 'a\r\rb', 'a\r\rb', 'a\rb'],
  ['F6', 'a\u200Bb\n\n\nc', 'a\u200Bb\n\nc', 'a\u200Bb\nc'],
  ['F7', ' \n\u200B\n\t', '', ''],
  ['F8', '', '', ''],
  ['F9', 'a\nb', 'a\nb', 'a\nb'],
  ['F10', 'a\n', 'a\n', 'a\n'],
  ['F11', 'a\n\u3000\u2060 \nb', 'a\n\nb', 'a\nb'],
  ['F12', 'a\r\n\nb\r', 'a\n\nb\n', 'a\nb\n'],
];

describe('frozen fixtures', () => {
  for (const [id, input, collapsed, removed] of fixtures) {
    it(`${id} Collapse`, () => expect(run(input, op('collapse'))).toBe(collapsed));
    it(`${id} Remove whitespace`, () => expect(run(input, op('removeBlank'))).toBe(removed));
    it(`${id} idempotence`, () => {
      for (const type of ['collapse', 'removeBlank']) {
        const once = run(input, op(type));
        expect(run(once, op(type))).toBe(once);
      }
    });
  }
  it('F12 mixed notice', () => expect(transformText(fixtures[11][1], [op('collapse')]).mixed).toBe(true));
  it('E1 empty only preserves F2', () => expect(run(fixtures[1][1], op('removeBlank', { emptyOnly: true }))).toBe(fixtures[1][1]));
  it('E2 empty only removes F1 blanks', () => expect(run(fixtures[0][1], op('removeBlank', { emptyOnly: true }))).toBe('a\nb'));
  it('T1 trims blank set', () => expect(run(' a \n\t\u200Bb\u00A0', op('trim'))).toBe('a\nb'));
  it('T2 keeps interior invisible characters', () => expect(run('x\u200By ', op('trim'))).toBe('x\u200By'));
  it('P1 prefix then remove', () => expect(run('a\n\nb', op('prefix', { text: '> ' }), op('removeBlank'))).toBe('> a\n> \n> b'));
  it('P2 remove then prefix', () => expect(run('a\n\nb', op('removeBlank'), op('prefix', { text: '> ' }))).toBe('> a\n> b'));
});

describe('pipeline contracts', () => {
  it('disabled F2 operation is inert', () => expect(run(fixtures[1][1], op('collapse', { enabled: false }))).toBe(fixtures[1][1]));
  it('repeats prefixes', () => expect(run('a', op('prefix', { text: '>' }), op('prefix', { text: '+' }))).toBe('+>a'));
  it('dedupes exact lines keeping the first', () => expect(run('B\na\nB\nA\na\n', op('dedupe'))).toBe('B\na\nA\n'));
  it('sorts Unicode code points in either direction', () => {
    expect(run('\u{10000}\n\uE000\na\nA', op('sort'))).toBe('A\na\n\uE000\n\u{10000}');
    expect(run('a\nc\nb', op('sort', { reverse: true }))).toBe('c\nb\na');
  });
  it('changes case independently of locale', () => {
    expect(run('Straße\ni', op('uppercase'))).toBe('STRASSE\nI');
    expect(run('ABC\nÉ', op('lowercase'))).toBe('abc\né');
  });
  it('adds literal suffixes', () => expect(run('a\n\nb\n', op('suffix', { text: '$&' }))).toBe('a$&\n$&\nb$&\n'));
  it('replaces every literal match, including metacharacters and dollar replacements', () => {
    expect(run('a.* a.* A.*', op('replace', { find: 'a.*', replacement: '$&' }))).toBe('$& $& A.*');
  });
  it('insensitive replace preserves unmatched spans byte for byte', () => {
    expect(run('MiXeD\u200B AbC abc! É', op('replace', { find: 'ABC', replacement: 'x', caseSensitive: false }))).toBe('MiXeD\u200B x x! É');
  });
  it.each(['\n', '\r'])('R4 rejects a search containing %j instead of matching across lines', ending => {
    const input = 'a\nb\n';
    expect(transformText(input, [op('replace', { find: `${ending}b`, replacement: '+' })]))
      .toMatchObject({ text: input, error: expect.any(String) });
  });
  it.each(['\r', '\n'])('R5 rejects a replacement containing %j atomically', ending => {
    const input = ' a\r\nb\r\n';
    expect(transformText(input, [op('trim'), op('replace', { find: 'a', replacement: ending })]))
      .toMatchObject({ text: input, error: expect.any(String) });
  });
  it.each([
    ['R1', ' ', '>'],
    ['R2', ' \n ', '>\n>'],
  ])('%s preserves empty unterminated lines through a non-matching replace', (_, input, expected) => {
    expect(run(input, op('trim'), op('replace', { find: 'x', replacement: 'y' }), op('prefix', { text: '>' })))
      .toBe(expected);
  });
  it('R3 preserves CRLF and the terminal newline during insensitive replace within lines', () => {
    expect(run('a\r\nXa\r\n', op('replace', { find: 'x', replacement: 'y', caseSensitive: false })))
      .toBe('a\r\nya\r\n');
  });
  it('reports mixed from untouched F12 input on a validation error', () => {
    const input = fixtures[11][1];
    expect(transformText(input, [op('trim'), op('replace')]))
      .toMatchObject({ text: input, error: expect.any(String), mixed: true });
  });
  it('rejects empty find atomically before applying any changes', () => {
    expect(transformText(' a ', [op('trim'), op('replace')])).toMatchObject({ text: ' a ', error: expect.any(String) });
    expect(run(' a ', op('replace', { enabled: false }))).toBe(' a ');
  });
  it('rejects invalid types and line-ending styles without changing input', () => {
    for (const operation of [{ type: 'unknown', enabled: true }, op('endings', { style: 'invalid' })]) {
      expect(transformText('a\r\nb', [operation])).toMatchObject({ text: 'a\r\nb', error: expect.any(String) });
    }
  });
  it('normalizes to each supported terminator preserving the final flag', () => {
    for (const style of ['\n', '\r\n', '\r']) expect(run('a\nb\n', op('endings', { style }))).toBe(`a${style}b${style}`);
  });
  it('parses final newlines and empty input', () => {
    expect(parseText('a\n')).toMatchObject({ lines: ['a'], terminalNewline: true });
    expect(parseText('')).toMatchObject({ lines: [], terminalNewline: false });
    expect(run('\n', op('collapse'))).toBe('');
  });
  it('includes all four extra invisible blanks in collapse and trim', () => {
    expect(run('a\n\u200C\u200D\u2060\u200B\nb', op('collapse'))).toBe('a\n\nb');
    expect(run('\u200Ca\u200D', op('trim'))).toBe('a');
  });
});
