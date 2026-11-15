/**
 * @file textTransform.js
 * @description Pure ordered text operations with lossless line-ending metadata
 * @license MIT
 * @see https://github.com/vintagedon/ops-toolbox
 */

const BLANK = /^[\s\u200B\u200C\u200D\u2060]*$/u;
const TRIM_BLANK = /^[\s\u200B\u200C\u200D\u2060]+|[\s\u200B\u200C\u200D\u2060]+$/gu;

export const OPERATIONS = [
  { type: 'collapse', label: 'Collapse blank lines' },
  { type: 'removeBlank', label: 'Remove blank lines', defaults: { emptyOnly: false } },
  { type: 'trim', label: 'Trim lines' },
  { type: 'endings', label: 'Normalize line endings', defaults: { style: '\n' } },
  { type: 'dedupe', label: 'Remove duplicate lines' },
  { type: 'sort', label: 'Sort lines', defaults: { reverse: false } },
  { type: 'uppercase', label: 'Uppercase (locale-independent)' },
  { type: 'lowercase', label: 'Lowercase (locale-independent)' },
  { type: 'prefix', label: 'Prefix', defaults: { text: '' } },
  { type: 'suffix', label: 'Suffix', defaults: { text: '' } },
  { type: 'replace', label: 'Find / replace', defaults: { find: '', replacement: '', caseSensitive: true } },
];

export function createOperation(type, id) {
  const descriptor = OPERATIONS.find(operation => operation.type === type);
  if (!descriptor) throw new Error('Unknown operation');
  return { id, type, enabled: true, ...descriptor.defaults };
}

/** Parse terminators longest first; a final terminator ends, rather than adds, a line. */
export function parseText(text) {
  const terminators = text.match(/\r\n|\r|\n/g) ?? [];
  const terminalNewline = /(?:\r\n|\r|\n)$/.test(text);
  const lines = text === '' ? [] : text.split(/\r\n|\r|\n/);
  if (terminalNewline) lines.pop();
  const mixed = new Set(terminators).size > 1;
  return { lines, style: mixed ? '\n' : (terminators[0] ?? '\n'), terminalNewline, mixed };
}

export function serializeText({ lines, style, terminalNewline }) {
  return lines.length ? lines.join(style) + (terminalNewline ? style : '') : '';
}

export function isBlank(line) {
  return BLANK.test(line);
}

function collapse(lines) {
  const output = [];
  let pendingBlank = false;
  for (const line of lines) {
    if (isBlank(line)) {
      if (output.length) pendingBlank = true;
    } else {
      if (pendingBlank) output.push('');
      output.push(line);
      pendingBlank = false;
    }
  }
  return output;
}

/** Compare numeric Unicode code points, including supplementary-plane characters. */
function compareCodePoints(left, right) {
  const a = Array.from(left, char => char.codePointAt(0));
  const b = Array.from(right, char => char.codePointAt(0));
  for (let i = 0; i < Math.min(a.length, b.length); i++) {
    if (a[i] !== b[i]) return a[i] - b[i];
  }
  return a.length - b.length;
}

function validationError(operation) {
  if (!OPERATIONS.some(descriptor => descriptor.type === operation.type)) return 'Unknown operation.';
  if (operation.type === 'replace' && (typeof operation.find !== 'string' || !operation.find.length)) {
    return 'Find text must not be empty.';
  }
  if (operation.type === 'endings' && !['\n', '\r\n', '\r'].includes(operation.style)) {
    return 'Choose LF, CRLF or CR line endings.';
  }
  if (['prefix', 'suffix'].includes(operation.type) && typeof operation.text !== 'string') {
    return 'Prefix and suffix must be literal text.';
  }
  if (operation.type === 'replace' && typeof operation.replacement !== 'string') return 'Replacement must be literal text.';
  return null;
}

/** Evaluate atomically: invalid enabled operations return the untouched input. */
export function transformText(input, operations) {
  const enabled = operations.filter(operation => operation.enabled);
  for (const operation of enabled) {
    const error = validationError(operation);
    if (error) return { text: input, error, mixed: false };
  }
  const model = parseText(input);
  for (const operation of enabled) {
    switch (operation.type) {
      case 'collapse': model.lines = collapse(model.lines); break;
      case 'removeBlank': model.lines = model.lines.filter(line => operation.emptyOnly ? line !== '' : !isBlank(line)); break;
      case 'trim': model.lines = model.lines.map(line => line.replace(TRIM_BLANK, '')); break;
      case 'endings': model.style = operation.style; break;
      case 'dedupe': model.lines = [...new Set(model.lines)]; break;
      case 'sort': model.lines = [...model.lines].sort(compareCodePoints); if (operation.reverse) model.lines.reverse(); break;
      case 'uppercase': model.lines = model.lines.map(line => line.toUpperCase()); break;
      case 'lowercase': model.lines = model.lines.map(line => line.toLowerCase()); break;
      case 'prefix': model.lines = model.lines.map(line => operation.text + line); break;
      case 'suffix': model.lines = model.lines.map(line => line + operation.text); break;
      case 'replace': {
        // Escape every metacharacter: users supply literal strings, never patterns.
        const escaped = operation.find.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const pattern = new RegExp(escaped, operation.caseSensitive ? 'gu' : 'giu');
        const replaced = parseText(serializeText(model).replace(pattern, () => operation.replacement));
        Object.assign(model, replaced, { mixed: model.mixed || replaced.mixed });
        break;
      }
    }
  }
  return { text: serializeText(model), error: null, mixed: model.mixed };
}
