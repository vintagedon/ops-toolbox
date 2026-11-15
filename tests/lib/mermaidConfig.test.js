/**
 * @file mermaidConfig.test.js
 * @description Protect strict Mermaid security across supported diagram themes and layouts
 * @author vintagedon
 * @license MIT
 */

import { describe, expect, it } from 'vitest';
import { getMermaidConfig } from '../../src/tools/mermaid-renderer/config.js';

describe.each(['dark', 'light'])('Mermaid security with %s theme', (theme) => {
  it.each(['dagre', 'elk'])('keeps securityLevel strict with %s layout', (layout) => {
    expect(getMermaidConfig(theme, layout).securityLevel).toBe('strict');
  });
});
