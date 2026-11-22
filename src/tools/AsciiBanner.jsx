/**
 * @file AsciiBanner.jsx
 * @description ASCII art text generator using figlet fonts with configurable width and layout
 * @author vintagedon
 * @license MIT
 * @see https://github.com/radioastronomyio/ops-toolbox
 */

import React, { useState, useEffect } from 'react';
import { getAvailableFonts, generateBanner } from '../lib/asciiBanner.js';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import CopyButton from '../components/CopyButton';

// Quick-access font shortcuts shown as buttons above the full dropdown
const PRESET_FONTS = ['Standard', 'Big', 'Slant', 'Banner', 'Block', 'Doom'];
const LAYOUT_OPTIONS = [
  { value: 'default', label: 'Default' },
  { value: 'full', label: 'Full' },
  { value: 'fitted', label: 'Fitted' },
];

export default function AsciiBanner() {
  const [text, setText] = useState('');
  const [font, setFont] = useState('Standard');
  const [width, setWidth] = useState(80);
  const [layout, setLayout] = useState('default');
  const [output, setOutput] = useState('');
  const [fonts, setFonts] = useState([]);
  // Debounce input to avoid re-rendering figlet on every keystroke
  const debouncedText = useDebouncedValue(text, 300);

  useEffect(() => {
    setFonts(getAvailableFonts());
  }, []);

  useEffect(() => {
    let current = true;
    generateBanner(debouncedText, font, { width, horizontalLayout: layout })
      .then(result => { if (current) setOutput(result); })
      .catch(() => { if (current) setOutput(''); });
    return () => { current = false; };
  }, [debouncedText, font, width, layout]);

  const lines = output ? output.split('\n').length : 0;
  const chars = output ? output.length : 0;

  const handleDownload = () => {
    const blob = new Blob([output], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'banner.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold text-text-primary">ASCII Banner</h1>

      {/* Text input */}
      <div className="bg-surface-1 rounded-md p-4 space-y-3">
        <label className="block text-sm font-medium text-text-secondary">Text (max 50 chars)</label>
        <input
          type="text"
          value={text}
          onChange={e => setText(e.target.value.slice(0, 50))}
          placeholder="Hello World"
          maxLength={50}
          className="w-full bg-bg border border-border rounded px-3 py-2 text-text-primary font-mono focus:outline-none focus:border-accent"
        />
      </div>

      {/* Font options */}
      <div className="bg-surface-1 rounded-md p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-text-secondary">Font</label>
            <select
              value={font}
              onChange={e => setFont(e.target.value)}
              className="w-full bg-bg border border-border rounded px-2 py-1.5 text-text-primary focus:outline-none"
            >
              {fonts.map(f => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-text-secondary">Width</label>
            <input
              type="number"
              value={width}
              onChange={e => setWidth(Math.min(200, Math.max(40, Number(e.target.value))))}
              min={40}
              max={200}
              className="w-full bg-bg border border-border rounded px-2 py-1.5 text-text-primary focus:outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-text-secondary">Layout</label>
            <select
              value={layout}
              onChange={e => setLayout(e.target.value)}
              className="w-full bg-bg border border-border rounded px-2 py-1.5 text-text-primary focus:outline-none"
            >
              {LAYOUT_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Preset font buttons */}
        <div className="flex flex-wrap gap-2">
          {PRESET_FONTS.map(f => (
            <button
              key={f}
              onClick={() => setFont(f)}
              className={`px-3 py-1 text-sm rounded transition-micro ${
                font === f
                  ? 'bg-accent text-black'
                  : 'bg-surface-2 hover:bg-surface-3 text-text-primary'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Output */}
      <div className="bg-surface-1 rounded-md p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-sm text-text-secondary">
            {lines} lines · {chars} characters
          </div>
          <div className="flex gap-2">
            <CopyButton text={output} className="py-1.5 text-sm" />
            <button
              onClick={handleDownload}
              className="px-3 py-1.5 bg-surface-2 hover:bg-surface-3 text-text-primary text-sm rounded transition-micro"
            >
              Download
            </button>
          </div>
        </div>
        <pre className="bg-bg rounded p-4 text-text-secondary text-xs font-mono overflow-x-auto whitespace-pre min-h-16">
          {output || <span className="text-text-muted">Output will appear here…</span>}
        </pre>
      </div>
    </div>
  );
}
