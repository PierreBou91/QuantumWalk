import type { QuantumStep } from '../../types/quantum';
import type { MatchResult } from '../../types/matching';

/**
 * Exports quantum steps to JSON format
 *
 * @param steps - Array of quantum steps
 * @param metadata - Optional metadata to include
 * @returns JSON string
 */
export function exportStepsToJSON(
  steps: QuantumStep[],
  metadata?: Record<string, any>
): string {
  const data = {
    metadata: {
      exportDate: new Date().toISOString(),
      version: '1.0',
      stepCount: steps.length,
      ...metadata,
    },
    steps: steps.map((step) => ({
      index: step.index,
      timestamp: step.timestamp,
      interval: step.interval,
      hash: step.hash,
      isoString: step.isoString,
    })),
  };

  return JSON.stringify(data, null, 2);
}

/**
 * Exports match result to JSON format
 *
 * @param result - Match result
 * @returns JSON string
 */
export function exportMatchResultToJSON(result: MatchResult): string {
  const data = {
    metadata: {
      exportDate: new Date().toISOString(),
      version: '1.0',
    },
    similarityScore: result.similarityScore,
    alignment: {
      offset: result.alignment.offset,
      length: result.alignment.length,
    },
    statistics: result.statistics,
    userIntervals: result.userIntervals,
    quantumIntervals: result.quantumIntervals,
    matchedSteps: result.matchedSteps.map((step) => ({
      index: step.index,
      timestamp: step.timestamp,
      interval: step.interval,
      isoString: step.isoString,
    })),
  };

  return JSON.stringify(data, null, 2);
}

/**
 * Downloads JSON data as a file
 *
 * @param jsonData - JSON string
 * @param filename - Filename for download
 */
export function downloadJSON(jsonData: string, filename: string): void {
  const blob = new Blob([jsonData], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
