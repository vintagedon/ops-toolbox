/**
 * @file App.jsx
 * @description Root SPA router with lazy-loaded tool routes driven by the tool registry
 * @author vintagedon
 * @license MIT
 * @see https://github.com/radioastronomyio/ops-toolbox
 */

import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { toolRegistry } from './lib/toolRegistry';
import ToolLayout from './components/ToolLayout';
import DirectoryGrid from './components/DirectoryGrid';
import NotFound from './components/NotFound';

const About = lazy(() => import('./pages/About'));

// Map each tool registry id to its lazy-loaded component for code-splitting
const toolComponents = {
  'subnet-calculator': lazy(() => import('./tools/SubnetCalculator')),
  'jwt-decoder': lazy(() => import('./tools/JwtDecoder')),
  'password-generator': lazy(() => import('./tools/PasswordGenerator')),
  'json-yaml': lazy(() => import('./tools/JsonYamlConverter')),
  'text-transformer': lazy(() => import('./tools/TextTransformer')),
  'base64': lazy(() => import('./tools/Base64Codec')),
  'mermaid-renderer': lazy(() => import('./tools/mermaid-renderer/MermaidRenderer')),
  'cidr-expander': lazy(() => import('./tools/CidrExpander')),
  'url-parser': lazy(() => import('./tools/UrlParser')),
  'useragent-decoder': lazy(() => import('./tools/UserAgentDecoder')),
  'chmod-calculator': lazy(() => import('./tools/ChmodCalculator')),
  'ssh-keygen': lazy(() => import('./tools/SshKeyGenerator')),
  'x509-parser': lazy(() => import('./tools/X509Parser')),
  'file-hash-calculator': lazy(() => import('./tools/FileHashCalculator')),
  'bcrypt-hash-verifier': lazy(() => import('./tools/BcryptHashVerifier')),
  'json-diff': lazy(() => import('./tools/JsonDiff')),
  'csv-to-json': lazy(() => import('./tools/CsvToJson')),
  'sql-formatter': lazy(() => import('./tools/SqlFormatter')),
  'url-encoder': lazy(() => import('./tools/UrlQueryEncoder')),
  'cron-parser': lazy(() => import('./tools/CronParser')),
  'regex-tester': lazy(() => import('./tools/RegexTester')),
  'ascii-banner': lazy(() => import('./tools/AsciiBanner')),
  'uuid-generator': lazy(() => import('./tools/UuidGenerator')),
  'epoch-time': lazy(() => import('./tools/UnixEpochTool')),
  'markdown-previewer': lazy(() => import('./tools/MarkdownPreviewer')),
};

function Loading() {
  return (
    <div className="flex items-center justify-center h-64 text-text-muted">
      Loading tool…
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ToolLayout />}>
          <Route index element={<DirectoryGrid />} />
          {/* Non-tool routes */}
          <Route
            path="about"
            element={
              <Suspense fallback={<Loading />}>
                <About />
              </Suspense>
            }
          />
          {/* Dynamically generate routes from the central tool registry */}
          {toolRegistry.map((tool) => {
            const Component = toolComponents[tool.id];
            if (!Component) {
              console.warn(`No component mapped for tool: ${tool.id}`);
              return null;
            }
            return (
              <Route
                key={tool.path}
                path={tool.path}
                element={
                  <Suspense fallback={<Loading />}>
                    <Component />
                  </Suspense>
                }
              />
            );
          })}
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
