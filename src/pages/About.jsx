/**
 * @file About.jsx
 * @description About page — a short portfolio narrative for ops-toolbox: what it is, the client-side posture, the stack, and outbound links to the repo and the consultancy.
 * @author vintagedon
 * @license MIT
 * @see https://github.com/radioastronomyio/ops-toolbox
 */

import { Link } from 'react-router-dom';

const GITHUB = 'https://github.com/radioastronomyio/ops-toolbox';
const CONSULTING = 'https://donaldfountain.ai';

export default function About() {
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-semibold text-text-primary mb-4">About Ops Toolbox</h1>

      <div className="space-y-4 text-sm text-text-secondary leading-relaxed">
        <p>
          Ops Toolbox is a collection of {25} small utilities for IT operations and platform
          engineering — network math, security parsing, data conversion, and developer helpers.
          Every tool runs entirely in the browser. There is no server, no API, and nothing leaves
          your device.
        </p>
        <p>
          That posture is deliberate. The toolkit is air-gap-friendly: it runs on a machine with no
          network connection, in a restricted enclave, or on a desktop you do not own, and it behaves
          identically. The privacy claim is unconditional because there is no code path that transmits
          input or output anywhere.
        </p>
        <p>
          It is built as a single-page React application — React 18 and Vite, Tailwind CSS, and
          Vitest. Each tool is lazy-loaded, theming is driven by a <code className="text-accent">data-theme</code> attribute
          with a high-contrast accessibility theme, and all computation lives in plain, testable
          functions separate from the UI.
        </p>
        <p>
          The full source is open. Read it, run it yourself, or self-host it behind your own perimeter.
        </p>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <a
          href={GITHUB}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center px-4 py-2 bg-accent hover:bg-accent-hover text-black text-sm font-medium rounded-md transition-micro"
        >
          View on GitHub
        </a>
        <a
          href={CONSULTING}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center px-4 py-2 bg-surface-1 hover:bg-surface-2 border border-border text-text-primary text-sm font-medium rounded-md transition-micro"
        >
          Donald Fountain
        </a>
        <Link
          to="/"
          className="inline-flex items-center px-4 py-2 text-text-secondary hover:text-text-primary text-sm font-medium rounded-md transition-micro"
        >
          ← All Tools
        </Link>
      </div>
    </div>
  );
}
