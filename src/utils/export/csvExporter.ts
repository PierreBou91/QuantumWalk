import type { QuantumStep } from '../../types/quantum';
import type { MatchResult } from '../../types/matching';

/**
 * Exports quantum steps to CSV format
 *
 * @param steps - Array of quantum steps
 * @returns CSV string
 */
export function exportStepsToCSV(steps: QuantumStep[]): string {
  const headers = ['Index', 'Timestamp', 'ISO String', 'Interval (ms)', 'Hash'];
  const rows = steps.map((step) => [
    step.index,
    step.timestamp,
    step.isoString,
    step.interval,
    step.hash,
  ]);

  const csvLines = [
    headers.join(','),
    ...rows.map((row) => row.join(',')),
  ];

  return csvLines.join('\n');
}

/**
 * Exports match result comparison to CSV format
 *
 * @param result - Match result
 * @returns CSV string
 */
export function exportMatchResultToCSV(result: MatchResult): string {
  const headers = [
    'Index',
    'User Interval (ms)',
    'Quantum Interval (ms)',
    'Difference (ms)',
    'Difference (%)',
    'Quantum Step Index',
    'Quantum Timestamp',
  ];

  const rows = result.userIntervals.map((userInterval, i) => {
    const quantumInterval = result.quantumIntervals[i];
    const diff = Math.abs(userInterval - quantumInterval);
    const diffPercent = ((diff / Math.max(userInterval, quantumInterval)) * 100).toFixed(2);
    const matchedStep = result.matchedSteps[i];

    return [
      i,
      userInterval,
      quantumInterval,
      diff,
      diffPercent,
      matchedStep.index,
      matchedStep.timestamp,
    ];
  });

  // Add summary statistics at the top
  const summary = [
    ['Summary Statistics', ''],
    ['Similarity Score', (result.similarityScore * 100).toFixed(2) + '%'],
    ['Alignment Offset', result.alignment.offset],
    ['Mean Error (ms)', result.statistics.meanError.toFixed(2)],
    ['Max Error (ms)', result.statistics.maxError.toFixed(2)],
    ['Correlation', result.statistics.correlation.toFixed(4)],
    ['RMSE (ms)', result.statistics.rmse.toFixed(2)],
    ['', ''], // Empty row separator
  ];

  const csvLines = [
    ...summary.map((row) => row.join(',')),
    headers.join(','),
    ...rows.map((row) => row.join(',')),
  ];

  return csvLines.join('\n');
}

/**
 * Downloads CSV data as a file
 *
 * @param csvData - CSV string
 * @param filename - Filename for download
 */
export function downloadCSV(csvData: string, filename: string): void {
  const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
