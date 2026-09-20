/**
 * @file SettingsFlyout.jsx
 * @description Non-modal settings flyout for theme, density, and font family preferences. Theme is a menu driven by the declared theme list; density and font remain segmented.
 * @author vintagedon
 * @license MIT
 * @see https://github.com/radioastronomyio/ops-toolbox
 */

import { useState, useRef, useEffect } from 'react';

/**
 * Segmented control for 2-3 options. Fills the width of its container and
 * divides it evenly among the options rather than sizing to its labels, so a
 * long label cannot push the control past the edge of the flyout. Each cell
 * truncates rather than growing, which keeps the layout stable under the
 * monospace font preference where labels are widest.
 */
function SegmentedControl({ options, value, onChange }) {
  return (
    <div className="flex w-full p-0.5 bg-surface-2 border border-border rounded-md">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`flex-1 min-w-0 truncate px-1.5 py-1.5 text-xs font-medium rounded transition-micro ${
            value === opt.value
              ? 'bg-surface-1 text-text-primary shadow-sm ring-1 ring-border-subtle'
              : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

/**
 * Theme menu driven by a declared theme list. Renders one selectable
 * option per theme so the control scales to four or more themes. Behaves
 * as a radiogroup; the active option matches the current preference.
 */
function ThemeMenu({ themes, value, onChange }) {
  return (
    <div
      className="flex flex-col gap-0.5 bg-surface-2 border border-border rounded-md p-1"
      role="radiogroup"
      aria-label="Theme selection"
    >
      {themes.map((opt) => {
        const active = value === opt.value;
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            role="radio"
            aria-checked={active}
            className={`flex items-center gap-2 px-2.5 py-1.5 text-xs font-medium text-left rounded transition-micro ${
              active
                ? 'bg-surface-1 text-text-primary shadow-sm ring-1 ring-border-subtle'
                : 'text-text-secondary hover:text-text-primary hover:bg-surface-3/60'
            }`}
          >
            <span
              aria-hidden="true"
              className={`inline-block w-1.5 h-1.5 rounded-full ${active ? 'bg-accent' : 'bg-transparent'}`}
            />
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

export default function SettingsFlyout({ theme, density, fontFamily }) {
  const [open, setOpen] = useState(false);
  const flyoutRef = useRef(null);
  const buttonRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handleClick(e) {
      if (
        flyoutRef.current && !flyoutRef.current.contains(e.target) &&
        buttonRef.current && !buttonRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    }
    function handleEscape(e) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open]);

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => setOpen(!open)}
        className="p-2 rounded text-text-secondary hover:text-text-primary hover:bg-surface-2 transition-micro"
        aria-label="Display settings"
        aria-expanded={open}
      >
        {/* Settings gear icon — inline SVG to avoid lucide dependency in shell */}
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      </button>

      {open && (
        <div
          ref={flyoutRef}
          className="absolute right-0 top-full mt-2 w-80 bg-surface-1 border border-border rounded-md shadow-sm p-4 space-y-4 z-50 transition-enter"
          role="dialog"
          aria-label="Display settings"
        >
          {/* Theme — menu driven by the declared theme list */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-text-secondary micro-label">Theme</label>
            <ThemeMenu
              themes={theme.themes}
              value={theme.preference}
              onChange={theme.setTheme}
            />
          </div>

          {/* Density */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-text-secondary micro-label">Density</label>
            <SegmentedControl
              options={[
                { value: 'compact', label: 'Compact' },
                { value: 'default', label: 'Default' },
                { value: 'comfortable', label: 'Comfortable' },
              ]}
              value={density.density}
              onChange={density.setDensity}
            />
          </div>

          {/* Font */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-text-secondary micro-label">Font</label>
            <SegmentedControl
              options={[
                { value: 'system', label: 'System' },
                { value: 'inter', label: 'Inter' },
                { value: 'mono', label: 'Mono' },
              ]}
              value={fontFamily.fontFamily}
              onChange={fontFamily.setFontFamily}
            />
          </div>
        </div>
      )}
    </div>
  );
}
