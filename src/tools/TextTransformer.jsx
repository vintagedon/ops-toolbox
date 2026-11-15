/**
 * @file TextTransformer.jsx
 * @description Local text workspace with ordered preview, bounded undo and UTF-8 files
 * @license MIT
 * @see https://github.com/vintagedon/ops-toolbox
 */
import { useMemo, useRef, useState } from 'react';
import { OPERATIONS, createOperation, parseText, transformText } from '../lib/textTransform.js';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import CopyButton from '../components/CopyButton';
import ErrorBanner from '../components/ErrorBanner';

const control = 'min-w-0 max-w-full px-3 py-2 bg-surface-1 text-text-primary border border-border rounded-md text-sm';
const button = 'px-3 py-2 bg-surface-2 hover:bg-surface-3 text-text-primary border border-border rounded-md text-sm disabled:opacity-40';
const MAX_BYTES = 2 * 1024 * 1024;
const emptySource = { text: '', bom: false };

/** Restore the current source style after textarea normalization; retain mixed import provenance. */
function editedSource(text, source) {
  const model = parseText(source.text);
  return {
    ...source,
    text: text.replace(/\n/g, model.style),
    mixed: source.mixed || model.mixed,
  };
}

function readBytes(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(new Uint8Array(reader.result));
    reader.onerror = () => reject(new Error('The file could not be read.'));
    reader.readAsArrayBuffer(file);
  });
}

/** Options belong to each instance, so repeating an operation is independent. */
function OperationOptions({ operation, change }) {
  switch (operation.type) {
    case 'removeBlank':
      return <label className="text-sm"><input type="checkbox" checked={operation.emptyOnly} onChange={event => change({ emptyOnly: event.target.checked })} /> Empty only (keep whitespace lines)</label>;
    case 'endings':
      return <label className="text-sm">Line endings <select className={control} value={operation.style} onChange={event => change({ style: event.target.value })}><option value={'\n'}>LF</option><option value={'\r\n'}>CRLF</option><option value={'\r'}>CR</option></select></label>;
    case 'sort':
      return <label className="text-sm"><input type="checkbox" checked={operation.reverse} onChange={event => change({ reverse: event.target.checked })} /> Reverse order</label>;
    case 'prefix':
    case 'suffix':
      return <label className="text-sm">Literal text <input className={control} value={operation.text} onChange={event => change({ text: event.target.value })} /></label>;
    case 'replace':
      return <div className="flex flex-wrap items-center gap-3">
        <label className="text-sm">Find <input className={control} value={operation.find} onChange={event => change({ find: event.target.value })} /></label>
        <label className="text-sm">Replace with <input className={control} value={operation.replacement} onChange={event => change({ replacement: event.target.value })} /></label>
        <label className="text-sm"><input type="checkbox" checked={operation.caseSensitive} onChange={event => change({ caseSensitive: event.target.checked })} /> Case sensitive</label>
      </div>;
    default: return null;
  }
}

export default function TextTransformer() {
  const [source, setSource] = useState(emptySource);
  const [baseline, setBaseline] = useState(emptySource);
  const [operations, setOperations] = useState(() => [createOperation('collapse', 0)]);
  const [undo, setUndo] = useState([]);
  const [error, setError] = useState(null);
  const [adding, setAdding] = useState('collapse');
  const nextId = useRef(1);
  const importRevision = useRef(0);
  const request = useMemo(() => ({ text: source.text, operations }), [source.text, operations]);
  const debounced = useDebouncedValue(request);
  const result = useMemo(() => transformText(debounced.text, debounced.operations), [debounced]);
  const stale = request !== debounced;
  const unavailable = stale || Boolean(result.error);
  const beforeLines = useMemo(() => parseText(source.text).lines.length, [source.text]);
  const afterLines = useMemo(() => parseText(result.text).lines.length, [result.text]);
  const mixed = useMemo(() => source.mixed || parseText(source.text).mixed, [source.text, source.mixed]);

  function updateOperation(id, changes) {
    setOperations(current => current.map(operation => operation.id === id ? { ...operation, ...changes } : operation));
  }

  function move(index, offset) {
    setOperations(current => {
      const reordered = [...current];
      [reordered[index], reordered[index + offset]] = [reordered[index + offset], reordered[index]];
      return reordered;
    });
  }

  function changeInput(text) {
    importRevision.current++;
    setSource(current => editedSource(text, current));
    setError(null);
  }

  function paste(event) {
    event.preventDefault();
    const field = event.currentTarget;
    const text = field.value.slice(0, field.selectionStart)
      + event.clipboardData.getData('text/plain').replace(/\r\n|\r/g, '\n')
      + field.value.slice(field.selectionEnd);
    const imported = { ...editedSource(text, source), bom: false };
    importRevision.current++;
    setSource(imported);
    setBaseline(imported);
    setUndo([]);
    setError(null);
  }

  async function importFile(event) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    const revision = ++importRevision.current;
    try {
      if (file.size > MAX_BYTES) throw new Error('Choose a UTF-8 text file no larger than 2 MiB.');
      const bytes = await readBytes(file);
      let text;
      try { text = new TextDecoder('utf-8', { fatal: true, ignoreBOM: true }).decode(bytes); }
      catch { throw new Error('The file is not valid UTF-8. Save it as UTF-8 text and try again.'); }
      if (text.includes('\0')) throw new Error('The file contains NUL characters. Choose a text file without NUL bytes.');
      const bom = text.startsWith('\uFEFF');
      const imported = { text: bom ? text.slice(1) : text, bom };
      if (revision !== importRevision.current) return;
      setSource(imported);
      setBaseline(imported);
      setUndo([]);
      setError(null);
    } catch (failure) {
      if (revision === importRevision.current) setError(failure.message);
    }
  }

  function apply() {
    if (unavailable) return;
    importRevision.current++;
    setUndo(current => [...current, { source, operations }].slice(-10));
    setSource({ ...source, text: result.text });
    setOperations([]);
    setError(null);
  }

  function undoApply() {
    const snapshot = undo.at(-1);
    if (!snapshot) return;
    importRevision.current++;
    setSource(snapshot.source);
    setOperations(snapshot.operations);
    setUndo(current => current.slice(0, -1));
    setError(null);
  }

  function restore() {
    if ((source.text !== baseline.text || source.bom !== baseline.bom)
      && !window.confirm('Restore the last imported or pasted text? Current input edits will be lost.')) return;
    importRevision.current++;
    setSource(baseline);
    setUndo([]);
    setError(null);
  }

  function download() {
    if (unavailable) return;
    const blob = new Blob([source.bom ? '\uFEFF' : '', result.text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'transformed.txt';
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="w-full min-w-0 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary mb-2">Text Transformer</h1>
        <p className="text-text-secondary">Paste text or import one UTF-8 file. Preview ordered changes locally, then copy, download or apply.</p>
      </div>
      <section className="space-y-3" aria-label="Operations">
        <div className="flex flex-wrap items-center gap-2">
          <label className="text-sm text-text-secondary" htmlFor="text-operation">Operation</label>
          <select id="text-operation" className={control} value={adding} onChange={event => setAdding(event.target.value)}>
            {OPERATIONS.map(operation => <option key={operation.type} value={operation.type}>{operation.label}</option>)}
          </select>
          <button className={button} onClick={() => setOperations(current => [...current, createOperation(adding, nextId.current++)])}>Add operation</button>
        </div>
        <ol className="space-y-2">
          {operations.map((operation, index) => (
            <li key={operation.id} className="min-w-0 p-3 bg-surface-1 border border-border rounded-md text-text-primary space-y-2" aria-label={`Operation ${index + 1}`}>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium">{index + 1}. {OPERATIONS.find(item => item.type === operation.type).label}</span>
                <label className="text-sm"><input type="checkbox" checked={operation.enabled} onChange={event => updateOperation(operation.id, { enabled: event.target.checked })} /> Enabled</label>
                <button className={button} aria-label={`Move operation ${index + 1} up`} disabled={index === 0} onClick={() => move(index, -1)}>Up</button>
                <button className={button} aria-label={`Move operation ${index + 1} down`} disabled={index === operations.length - 1} onClick={() => move(index, 1)}>Down</button>
                <button className={button} aria-label={`Remove operation ${index + 1}`} onClick={() => setOperations(current => current.filter(item => item.id !== operation.id))}>Remove</button>
              </div>
              <OperationOptions operation={operation} change={changes => updateOperation(operation.id, changes)} />
            </li>
          ))}
        </ol>
        {!operations.length && <p className="text-sm text-text-secondary">No operations. Preview matches Input.</p>}
      </section>
      <div className="flex flex-wrap gap-2 items-center">
        <label className={`${control} cursor-pointer`}>Import UTF-8 file (up to 2 MiB)<input type="file" accept=".txt,text/plain" className="block w-full text-sm mt-1" onChange={importFile} /></label>
        <button className={button} disabled={unavailable} onClick={apply}>Apply</button>
        <button className={button} disabled={!undo.length} onClick={undoApply}>Undo Apply</button>
        <span className="text-xs text-text-secondary">{undo.length}/10 undo steps</span>
        <button className={button} onClick={restore}>Restore original</button>
      </div>
      <ErrorBanner message={error || (!stale ? result.error : null)} />
      {mixed && <p className="text-sm text-status-info" role="status">Mixed line endings imported. Output uses LF unless an operation chooses another style.</p>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 min-w-0">
        <div className="min-w-0 space-y-2">
          <label htmlFor="text-input" className="block font-medium text-text-primary">Input</label>
          <p className="text-xs text-text-secondary">{beforeLines} lines, {source.text.length} characters (UTF-16 units)</p>
          <textarea id="text-input" className={`${control} w-full h-96 font-mono resize-y`} value={source.text} onChange={event => changeInput(event.target.value)} onPaste={paste} spellCheck={false} />
        </div>
        <div className="min-w-0 space-y-2">
          <span id="text-preview-label" className="block font-medium text-text-primary">Preview</span>
          <p className="text-xs text-text-secondary">{afterLines} lines, {result.text.length} characters (UTF-16 units)</p>
          <p className="text-xs text-text-secondary" role="status">{stale ? 'Updating preview...' : result.error ? 'Fix the operation to continue.' : 'Preview is current.'}</p>
          <pre role="textbox" aria-readonly="true" aria-labelledby="text-preview-label" aria-busy={stale} tabIndex={0} className={`${control} w-full h-96 overflow-auto whitespace-pre-wrap break-words font-mono`}>{result.text}</pre>
          <div className="flex flex-wrap items-center gap-2">
            <CopyButton text={unavailable ? '' : result.text} />
            <button className={button} disabled={unavailable} onClick={download}>Download .txt</button>
          </div>
        </div>
      </div>
    </div>
  );
}
