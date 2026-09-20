/**
 * @file secretBatch.js
 * @description CSV serialization for generated password and passphrase batches
 * @author vintagedon
 * @license MIT
 * @see https://github.com/radioastronomyio/ops-toolbox
 */

function escapeCsvCell(value) {
  return `"${String(value).replaceAll('"', '""')}"`;
}

/**
 * Serializes generated secrets and their entropy values as RFC 4180-style CSV.
 *
 * @param {{value: string, entropy: number}[]} results - Generated rows
 * @returns {string} CSV with value and entropy columns
 */
export function serializeSecretBatchCsv(results) {
  const rows = results.map(({ value, entropy }) => (
    `${escapeCsvCell(value)},${escapeCsvCell(entropy)}`
  ));
  return ['Value,Entropy (bits)', ...rows].join('\r\n');
}
