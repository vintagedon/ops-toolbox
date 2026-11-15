import { describe, it, expect } from 'vitest';
import {
  toolRegistry,
  getCategories,
  getToolsByCategory,
  getToolByPath,
  getToolCount,
  getRemoteTools,
  getToolsByStatus,
} from '../../src/lib/toolRegistry.js';
import * as lucide from 'lucide-react';

describe('toolRegistry', () => {
  it('exports an array of 25 tools', () => {
    expect(Array.isArray(toolRegistry)).toBe(true);
    expect(toolRegistry).toHaveLength(25);
  });

  it('every tool has required fields: id, name, description, path, category, componentPath', () => {
    for (const tool of toolRegistry) {
      expect(tool).toHaveProperty('id');
      expect(tool).toHaveProperty('name');
      expect(tool).toHaveProperty('description');
      expect(tool).toHaveProperty('path');
      expect(tool).toHaveProperty('category');
      expect(tool).toHaveProperty('componentPath');
      expect(typeof tool.id).toBe('string');
      expect(typeof tool.name).toBe('string');
      expect(typeof tool.description).toBe('string');
      expect(typeof tool.path).toBe('string');
      expect(typeof tool.category).toBe('string');
      expect(typeof tool.componentPath).toBe('string');
    }
  });

  it('every tool has a non-empty icon that resolves to a real lucide export', () => {
    for (const tool of toolRegistry) {
      expect(typeof tool.icon).toBe('string');
      expect(tool.icon.length).toBeGreaterThan(0);
      expect(lucide[tool.icon], `icon "${tool.icon}" for ${tool.id}`).toBeDefined();
    }
  });

  it('no duplicate ids', () => {
    const ids = toolRegistry.map(t => t.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });

  it('no duplicate paths', () => {
    const paths = toolRegistry.map(t => t.path);
    const unique = new Set(paths);
    expect(unique.size).toBe(paths.length);
  });

  it('every id matches its path (current invariant)', () => {
    for (const tool of toolRegistry) {
      expect(tool.id).toBe(tool.path);
    }
  });
});

describe('getCategories', () => {
  it('returns array of unique category strings', () => {
    const categories = getCategories();
    const unique = new Set(categories);
    expect(unique.size).toBe(categories.length);
    for (const cat of categories) {
      expect(typeof cat).toBe('string');
    }
  });

  it('preserves insertion order (Networking, Security, Data, Developer)', () => {
    const categories = getCategories();
    expect(categories[0]).toBe('Networking');
    expect(categories[1]).toBe('Security');
    expect(categories[2]).toBe('Data');
    expect(categories[3]).toBe('Developer');
  });
});

describe('getToolsByCategory', () => {
  it('returns only tools matching the given category', () => {
    const tools = getToolsByCategory('Networking');
    expect(tools.length).toBeGreaterThan(0);
    for (const tool of tools) {
      expect(tool.category).toBe('Networking');
    }
  });

  it('returns empty array for unknown category', () => {
    expect(getToolsByCategory('Quantum')).toEqual([]);
  });
});

describe('getToolByPath', () => {
  it('returns the correct tool for a known path', () => {
    const tool = getToolByPath('subnet-calculator');
    expect(tool).toBeDefined();
    expect(tool.id).toBe('subnet-calculator');
    expect(tool.name).toBe('Subnet Calculator');
  });

  it('returns undefined for an unknown path', () => {
    expect(getToolByPath('does-not-exist')).toBeUndefined();
  });
});

describe('getToolCount', () => {
  it('returns 25', () => {
    expect(getToolCount()).toBe(25);
  });
});

describe('toolRegistry — metadata fields', () => {
  const validProcessingModes = ['local', 'remote', 'hybrid'];
  const validStatuses = ['stable', 'beta', 'experimental'];

  it('every tool has processingMode field with value local, remote, or hybrid', () => {
    for (const tool of toolRegistry) {
      expect(validProcessingModes).toContain(tool.processingMode);
    }
  });

  it('every tool has offlineCapable field (boolean)', () => {
    for (const tool of toolRegistry) {
      expect(typeof tool.offlineCapable).toBe('boolean');
    }
  });

  it('every tool has status field with value stable, beta, or experimental', () => {
    for (const tool of toolRegistry) {
      expect(validStatuses).toContain(tool.status);
    }
  });

  it('ssh-keygen has status beta', () => {
    const tool = toolRegistry.find(t => t.id === 'ssh-keygen');
    expect(tool.status).toBe('beta');
  });

  it('all tools have processingMode local', () => {
    for (const tool of toolRegistry) {
      expect(tool.processingMode).toBe('local');
    }
  });
});

describe('getRemoteTools', () => {
  it('returns an empty array (no remote or hybrid tools)', () => {
    expect(getRemoteTools()).toEqual([]);
  });
});

describe('getToolsByStatus', () => {
  it('returns tools matching the given status', () => {
    const betaTools = getToolsByStatus('beta');
    expect(betaTools.length).toBeGreaterThan(0);
    for (const tool of betaTools) {
      expect(tool.status).toBe('beta');
    }
  });

  it('returns empty array for unused status values', () => {
    expect(getToolsByStatus('experimental')).toEqual([]);
  });
});
