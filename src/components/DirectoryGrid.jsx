/**
 * @file DirectoryGrid.jsx
 * @description Home page with micro-hero, live filtering, a colored category bar, and a fluid tool grid where each card carries a category-tinted icon and accent border
 * @author vintagedon
 * @license MIT
 * @see https://github.com/radioastronomyio/ops-toolbox
 */

import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { toolRegistry, getCategories } from '../lib/toolRegistry';
import {
  Network, ListTree, KeyRound, Lock, Terminal, FileLock, Hash, ShieldCheck,
  Braces, Binary, GitCompare, Table, Database, Workflow, Link as LinkIcon,
  MonitorSmartphone, LockKeyhole, Link2, CalendarClock, Regex, Type,
  Fingerprint, Clock, FileText, ListFilter, Cpu, EyeOff, Github,
} from 'lucide-react';

/** Registry icon name -> lucide component. */
const ICONS = {
  Network, ListTree, KeyRound, Lock, Terminal, FileLock, Hash, ShieldCheck,
  Braces, Binary, GitCompare, Table, Database, Workflow, Link: LinkIcon,
  MonitorSmartphone, LockKeyhole, Link2, CalendarClock, Regex, Type,
  Fingerprint, Clock, FileText, ListFilter,
};

/**
 * Per-category accent classes. Literal strings so Tailwind generates them.
 * Categories not listed fall back to the accent token (neutral-ish).
 */
const CATEGORY_STYLES = {
  Networking: { text: 'text-category-networking', dot: 'bg-category-networking', chipOn: 'bg-category-networking/15 border-category-networking/50 text-category-networking', borderOn: 'border-l-category-networking' },
  Security: { text: 'text-category-security', dot: 'bg-category-security', chipOn: 'bg-category-security/15 border-category-security/50 text-category-security', borderOn: 'border-l-category-security' },
  Data: { text: 'text-category-data', dot: 'bg-category-data', chipOn: 'bg-category-data/15 border-category-data/50 text-category-data', borderOn: 'border-l-category-data' },
  Developer: { text: 'text-category-developer', dot: 'bg-category-developer', chipOn: 'bg-category-developer/15 border-category-developer/50 text-category-developer', borderOn: 'border-l-category-developer' },
};

const NEUTRAL_CHIP = 'bg-surface-1 text-text-primary border-border-subtle';

function catStyle(category) {
  return CATEGORY_STYLES[category] || CATEGORY_STYLES.Developer;
}

function ToolCard({ tool }) {
  const showBadges = tool.status !== 'stable';
  const Icon = ICONS[tool.icon] || Network;
  const accent = catStyle(tool.category);
  return (
    <Link
      to={tool.path}
      className={`flex flex-col p-4 bg-surface-1 border border-border border-l-[3px] ${accent.borderOn} rounded-md transition-micro cursor-pointer group hover:bg-surface-2 hover:border-border-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg`}
    >
      <div className="flex items-start gap-3 mb-1.5">
        <Icon size={20} strokeWidth={2} className={`shrink-0 mt-0.5 ${accent.text}`} aria-hidden="true" />
        <h3 className="text-base font-medium text-text-primary group-hover:text-accent transition-micro">
          {tool.name}
        </h3>
      </div>
      {showBadges && (
        <div className="flex gap-1.5 mb-1.5 pl-[32px]">
          {tool.status === 'beta' && (
            <span className="inline-flex items-center px-1.5 py-0.5 text-xs font-medium rounded-sm bg-accent-muted text-accent-text border border-accent/30">
              Beta
            </span>
          )}
          {tool.status === 'experimental' && (
            <span className="inline-flex items-center px-1.5 py-0.5 text-xs font-medium rounded-sm bg-status-error/10 text-status-error border border-status-error/30">
              Experimental
            </span>
          )}
        </div>
      )}
      <p className="text-sm text-text-secondary leading-relaxed pl-[32px]">{tool.description}</p>
    </Link>
  );
}

export default function DirectoryGrid() {
  const categories = getCategories();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState(null);

  const filtered = useMemo(() => {
    let results = toolRegistry;
    if (activeCategory) {
      results = results.filter((t) => t.category === activeCategory);
    }
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      results = results.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q)
      );
    }
    return results;
  }, [search, activeCategory]);

  return (
    <div>
      {/* Micro-hero */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-text-primary mb-2">
          Client-Side Developer Utilities
        </h1>
        <p className="text-sm text-text-secondary mb-4 max-w-2xl">
          {toolRegistry.length} network, security, and parsing tools. All processing executes
          locally in your browser. Zero tracking. Zero telemetry.
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-surface-2 border border-border text-xs text-text-secondary rounded">
            <Cpu size={12} aria-hidden="true" /> 100% Local Processing
          </span>
          <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-surface-2 border border-border text-xs text-text-secondary rounded">
            <EyeOff size={12} aria-hidden="true" /> No Server Logs
          </span>
          <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-surface-2 border border-border text-xs text-text-secondary rounded">
            <Github size={12} aria-hidden="true" /> Open Source
          </span>
        </div>
      </div>

      {/* Search + Colored Category Bar */}
      <div className="mb-6 space-y-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter tools…"
          className="w-full max-w-md px-3 py-2 text-sm bg-surface-1 text-text-primary border border-border rounded shadow-sm placeholder:text-text-muted transition-micro hover:border-border-strong focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
        />
        <div
          className="inline-flex flex-wrap gap-1 p-1 bg-surface-2 border border-border rounded-md"
          role="group"
          aria-label="Filter by category"
        >
          <button
            onClick={() => setActiveCategory(null)}
            aria-pressed={!activeCategory}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-[4px] border transition-micro ${
              !activeCategory ? `${NEUTRAL_CHIP} shadow-sm` : 'border-transparent text-text-secondary hover:text-text-primary'
            }`}
          >
            All
          </button>
          {categories.map((cat) => {
            const accent = catStyle(cat);
            const active = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(active ? null : cat)}
                aria-pressed={active}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-[4px] border transition-micro ${
                  active ? `${accent.chipOn} shadow-sm` : 'border-transparent text-text-secondary hover:text-text-primary'
                }`}
              >
                <span className={`inline-block w-2 h-2 rounded-full ${accent.dot}`} aria-hidden="true" />
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Fluid Tool Grid */}
      <div
        className="grid gap-4"
        style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}
      >
        {filtered.map((tool) => (
          <ToolCard key={tool.id} tool={tool} />
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-text-muted py-12">
          No tools match your search.
        </p>
      )}
    </div>
  );
}
