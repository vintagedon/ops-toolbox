/**
 * @file toolRegistry.js
 * @description Canonical tool registry — single source of truth for all tool metadata, routing, and queries
 * @author vintagedon
 * @license MIT
 * @see https://github.com/radioastronomyio/ops-toolbox
 */

/**
 * Canonical tool registry. Every tool in the suite is registered here.
 * Routing, directory grid, search, docs, and badges all derive from this.
 *
 * To add a new tool:
 * 1. Add an entry to this array
 * 2. Add a lazy import in App.jsx mapped to the same `id`
 * 3. Create the component in src/tools/
 */
export const toolRegistry = [
  {
    id: 'subnet-calculator',
    name: 'Subnet Calculator',
    description: 'IPv4 CIDR arithmetic — network, broadcast, host range, and mask calculations.',
    path: 'subnet-calculator',
    category: 'Networking',
    icon: 'Network',
    componentPath: './tools/SubnetCalculator',
    processingMode: 'local',
    offlineCapable: true,
    status: 'stable',
  },
  {
    id: 'cidr-expander',
    name: 'CIDR Expander',
    description: 'Expand a CIDR block into its full IP range with enumeration for small subnets.',
    path: 'cidr-expander',
    category: 'Networking',
    icon: 'ListTree',
    componentPath: './tools/CidrExpander',
    processingMode: 'local',
    offlineCapable: true,
    status: 'stable',
  },
  {
    id: 'jwt-decoder',
    name: 'JWT Decoder',
    description: 'Inspect JSON Web Token headers and payload claims without exposing secrets.',
    path: 'jwt-decoder',
    category: 'Security',
    icon: 'KeyRound',
    componentPath: './tools/JwtDecoder',
    processingMode: 'local',
    offlineCapable: true,
    status: 'stable',
  },
  {
    id: 'password-generator',
    name: 'Password Generator',
    description: 'Cryptographically secure string generation using Web Crypto API entropy.',
    path: 'password-generator',
    category: 'Security',
    icon: 'Lock',
    componentPath: './tools/PasswordGenerator',
    processingMode: 'local',
    offlineCapable: true,
    status: 'stable',
  },
  {
    id: 'ssh-keygen',
    name: 'SSH Keypair Generator',
    description: 'Generate RSA SSH keypairs in-browser using node-forge. Private key stays on your device.',
    path: 'ssh-keygen',
    category: 'Security',
    icon: 'Terminal',
    componentPath: './tools/SshKeyGenerator',
    processingMode: 'local',
    offlineCapable: true,
    status: 'beta',
  },
  {
    id: 'x509-parser',
    name: 'X.509 Parser',
    description: 'Parse PEM certificates: subject, issuer, validity, key info, and extensions.',
    path: 'x509-parser',
    category: 'Security',
    icon: 'FileLock',
    componentPath: './tools/X509Parser',
    processingMode: 'local',
    offlineCapable: true,
    status: 'stable',
  },
  {
    id: 'file-hash-calculator',
    name: 'File Hash Calculator',
    description: 'Compute MD5, SHA-1, SHA-256, SHA-512 digests for any file. All processing in-browser.',
    path: 'file-hash-calculator',
    category: 'Security',
    icon: 'Hash',
    componentPath: './tools/FileHashCalculator',
    processingMode: 'local',
    offlineCapable: true,
    status: 'stable',
  },
  {
    id: 'bcrypt-hash-verifier',
    name: 'Bcrypt Verifier',
    description: 'Hash strings with bcrypt and verify passwords against stored hashes. Client-side only.',
    path: 'bcrypt-hash-verifier',
    category: 'Security',
    icon: 'ShieldCheck',
    componentPath: './tools/BcryptHashVerifier',
    processingMode: 'local',
    offlineCapable: true,
    status: 'stable',
  },
  {
    id: 'json-yaml',
    name: 'JSON ↔ YAML',
    description: 'Bidirectional conversion between JSON and YAML with real-time linting.',
    path: 'json-yaml',
    category: 'Data',
    icon: 'Braces',
    componentPath: './tools/JsonYamlConverter',
    processingMode: 'local',
    offlineCapable: true,
    status: 'stable',
  },
  {
    id: 'base64',
    name: 'Base64 Codec',
    description: 'Encode and decode Base64 strings with support for UTF-8 and binary data.',
    path: 'base64',
    category: 'Data',
    icon: 'Binary',
    componentPath: './tools/Base64Codec',
    processingMode: 'local',
    offlineCapable: true,
    status: 'stable',
  },
  {
    id: 'json-diff',
    name: 'JSON Diff',
    description: 'Side-by-side JSON diff with color-coded additions, deletions, and modifications.',
    path: 'json-diff',
    category: 'Data',
    icon: 'GitCompare',
    componentPath: './tools/JsonDiff',
    processingMode: 'local',
    offlineCapable: true,
    status: 'stable',
  },
  {
    id: 'csv-to-json',
    name: 'CSV to JSON',
    description: 'Convert CSV files or pasted text to formatted JSON with PapaParse.',
    path: 'csv-to-json',
    category: 'Data',
    icon: 'Table',
    componentPath: './tools/CsvToJson',
    processingMode: 'local',
    offlineCapable: true,
    status: 'stable',
  },
  {
    id: 'sql-formatter',
    name: 'SQL Formatter',
    description: 'Pretty-print SQL queries with dialect support: PostgreSQL, MySQL, T-SQL, BigQuery.',
    path: 'sql-formatter',
    category: 'Data',
    icon: 'Database',
    componentPath: './tools/SqlFormatter',
    processingMode: 'local',
    offlineCapable: true,
    status: 'stable',
  },
  {
    id: 'text-transformer',
    name: 'Text Transformer',
    description: 'Clean up pasted text with ordered operations: collapse or remove blank lines, trim, dedupe, sort, change case, and find and replace.',
    path: 'text-transformer',
    category: 'Data',
    icon: 'ListFilter',
    componentPath: './tools/TextTransformer',
    processingMode: 'local',
    offlineCapable: true,
    status: 'stable',
  },
  {
    id: 'mermaid-renderer',
    name: 'Mermaid Renderer',
    description: 'Paste mermaid diagram code and get rendered SVG with ELK layout engine.',
    path: 'mermaid-renderer',
    category: 'Developer',
    icon: 'Workflow',
    componentPath: './tools/mermaid-renderer/MermaidRenderer',
    processingMode: 'local',
    offlineCapable: true,
    status: 'stable',
  },
  {
    id: 'url-parser',
    name: 'URL Parser',
    description: 'Parse any URL into its component parts: protocol, host, path, params, and hash.',
    path: 'url-parser',
    category: 'Developer',
    icon: 'Link',
    componentPath: './tools/UrlParser',
    processingMode: 'local',
    offlineCapable: true,
    status: 'stable',
  },
  {
    id: 'useragent-decoder',
    name: 'User-Agent Decoder',
    description: 'Parse browser User-Agent strings into browser, OS, device, and engine components.',
    path: 'useragent-decoder',
    category: 'Developer',
    icon: 'MonitorSmartphone',
    componentPath: './tools/UserAgentDecoder',
    processingMode: 'local',
    offlineCapable: true,
    status: 'stable',
  },
  {
    id: 'chmod-calculator',
    name: 'Chmod Calculator',
    description: 'Bidirectional Unix permission converter: octal ↔ symbolic with interactive checkbox grid.',
    path: 'chmod-calculator',
    category: 'Developer',
    icon: 'LockKeyhole',
    componentPath: './tools/ChmodCalculator',
    processingMode: 'local',
    offlineCapable: true,
    status: 'stable',
  },
  {
    id: 'url-encoder',
    name: 'URL Encoder',
    description: 'Encode/decode URL components, parse full URLs, and build query strings.',
    path: 'url-encoder',
    category: 'Developer',
    icon: 'Link2',
    componentPath: './tools/UrlQueryEncoder',
    processingMode: 'local',
    offlineCapable: true,
    status: 'stable',
  },
  {
    id: 'cron-parser',
    name: 'Cron Parser',
    description: 'Translate cron expressions to human descriptions and preview next run times.',
    path: 'cron-parser',
    category: 'Developer',
    icon: 'CalendarClock',
    componentPath: './tools/CronParser',
    processingMode: 'local',
    offlineCapable: true,
    status: 'stable',
  },
  {
    id: 'regex-tester',
    name: 'Regex Tester',
    description: 'Test regular expressions with live match highlighting and capture group display.',
    path: 'regex-tester',
    category: 'Developer',
    icon: 'Regex',
    componentPath: './tools/RegexTester',
    processingMode: 'local',
    offlineCapable: true,
    status: 'stable',
  },
  {
    id: 'ascii-banner',
    name: 'ASCII Banner',
    description: 'Generate terminal-style ASCII art banners from text with figlet fonts.',
    path: 'ascii-banner',
    category: 'Developer',
    icon: 'Type',
    componentPath: './tools/AsciiBanner',
    processingMode: 'local',
    offlineCapable: true,
    status: 'stable',
  },
  {
    id: 'uuid-generator',
    name: 'UUID Generator',
    description: 'Generate cryptographically secure UUID v4 and v7 with bulk and format options.',
    path: 'uuid-generator',
    category: 'Developer',
    icon: 'Fingerprint',
    componentPath: './tools/UuidGenerator',
    processingMode: 'local',
    offlineCapable: true,
    status: 'stable',
  },
  {
    id: 'epoch-time',
    name: 'Unix Epoch',
    description: 'Convert Unix timestamps to human dates and vice versa, with live counter.',
    path: 'epoch-time',
    category: 'Developer',
    icon: 'Clock',
    componentPath: './tools/UnixEpochTool',
    processingMode: 'local',
    offlineCapable: true,
    status: 'stable',
  },
  {
    id: 'markdown-previewer',
    name: 'Markdown Previewer',
    description: 'Live Markdown editor with GFM support and XSS-safe HTML preview via DOMPurify.',
    path: 'markdown-previewer',
    category: 'Developer',
    icon: 'FileText',
    componentPath: './tools/MarkdownPreviewer',
    processingMode: 'local',
    offlineCapable: true,
    status: 'stable',
  },
];

/**
 * Get all unique categories in display order.
 */
export function getCategories() {
  const seen = new Set();
  const categories = [];
  for (const tool of toolRegistry) {
    if (!seen.has(tool.category)) {
      seen.add(tool.category);
      categories.push(tool.category);
    }
  }
  return categories;
}

/**
 * Get tools filtered by category.
 */
export function getToolsByCategory(category) {
  return toolRegistry.filter(t => t.category === category);
}

/**
 * Find a tool by its path segment.
 */
export function getToolByPath(path) {
  return toolRegistry.find(t => t.path === path);
}

/**
 * Get the total tool count.
 */
export function getToolCount() {
  return toolRegistry.length;
}

/**
 * Get tools that require network access.
 */
export function getRemoteTools() {
  return toolRegistry.filter(t => t.processingMode === 'remote' || t.processingMode === 'hybrid');
}

/**
 * Get tools by status.
 */
export function getToolsByStatus(status) {
  return toolRegistry.filter(t => t.status === status);
}
