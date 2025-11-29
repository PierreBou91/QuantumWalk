import type {
  MatchResult,
  SequenceAlignment,
  UserSequenceInput,
} from '../../types/matching';
import type { QuantumStep } from '../../types/quantum';
import {
  calculateSimilarity,
  calculateStatistics,
} from './similarityScore';
import {
  calculateStepsInRange,
  getInitialStep,
  calculateStepsForward,
} from '../quantum/stepCalculator';

/**
 * Converts user input to intervals array
 *
 * @param input - User sequence input
 * @returns Array of intervals in milliseconds
 */
export function parseUserInput(input: UserSequenceInput): number[] {
  if (input.type === 'intervals') {
    return input.values;
  } else {
    // Convert timestamps to intervals
    const intervals: number[] = [];
    for (let i = 1; i < input.values.length; i++) {
      intervals.push(input.values[i] - input.values[i - 1]);
    }
    return intervals;
  }
}

/**
 * Extracts intervals from quantum steps
 *
 * @param steps - Array of quantum steps
 * @returns Array of intervals in milliseconds
 */
export function extractIntervals(steps: QuantumStep[]): number[] {
  return steps.map((step) => step.interval);
}

/**
 * Finds the best alignment using sliding window approach
 *
 * @param userIntervals - User-provided intervals
 * @param quantumSteps - Quantum steps to search within
 * @param windowSize - Optional specific window size (defaults to user intervals length)
 * @returns Best sequence alignment
 */
export function findBestAlignment(
  userIntervals: number[],
  quantumSteps: QuantumStep[],
  windowSize?: number
): SequenceAlignment {
  const targetLength = windowSize || userIntervals.length;
  const quantumIntervals = extractIntervals(quantumSteps);

  let bestScore = -1;
  let bestOffset = 0;

  // Sliding window search
  for (
    let offset = 0;
    offset <= quantumIntervals.length - targetLength;
    offset++
  ) {
    const window = quantumIntervals.slice(offset, offset + targetLength);
    const score = calculateSimilarity(userIntervals, window);

    if (score > bestScore) {
      bestScore = score;
      bestOffset = offset;
    }
  }

  // Extract aligned steps
  const alignedSteps = quantumSteps.slice(
    bestOffset,
    bestOffset + targetLength
  );

  return {
    offset: bestOffset,
    length: targetLength,
    alignedSteps,
  };
}

/**
 * Performs complete sequence matching
 *
 * @param input - User sequence input
 * @param searchRange - Optional date range to limit search
 * @returns Complete match result
 */
export async function matchSequence(
  input: UserSequenceInput
): Promise<MatchResult> {
  // Parse user input to intervals
  const userIntervals = parseUserInput(input);

  if (userIntervals.length === 0) {
    throw new Error('No intervals to match');
  }

  // Get quantum steps to search
  let quantumSteps: QuantumStep[];

  if (input.searchRange) {
    // Search within specified range
    quantumSteps = await calculateStepsInRange(
      input.searchRange.start,
      input.searchRange.end
    );
  } else {
    // Default: search from epoch forward (first 10,000 steps)
    const initialStep = await getInitialStep();
    quantumSteps = await calculateStepsForward(initialStep, 10000);
  }

  if (quantumSteps.length < userIntervals.length) {
    throw new Error(
      'Search range too small for sequence length. Please expand the date range.'
    );
  }

  // Find best alignment
  const alignment = findBestAlignment(userIntervals, quantumSteps);

  // Extract quantum intervals from aligned steps
  const quantumIntervals = extractIntervals(alignment.alignedSteps);

  // Calculate similarity and statistics
  const similarityScore = calculateSimilarity(userIntervals, quantumIntervals);
  const statistics = calculateStatistics(userIntervals, quantumIntervals);

  return {
    similarityScore,
    alignment,
    matchedSteps: alignment.alignedSteps,
    statistics,
    userIntervals,
    quantumIntervals,
  };
}

/**
 * Parses interval string input (e.g., "3d 14h 23m, 2.5d, 48h")
 *
 * @param intervalString - Comma-separated interval strings
 * @returns Array of intervals in milliseconds
 */
export function parseIntervalString(intervalString: string): number[] {
  const parts = intervalString.split(',').map((s) => s.trim());
  const intervals: number[] = [];

  for (const part of parts) {
    let totalMs = 0;
    const pattern = /(\d+\.?\d*)\s*([dhms])/gi;
    let match;

    while ((match = pattern.exec(part)) !== null) {
      const value = parseFloat(match[1]);
      const unit = match[2].toLowerCase();

      switch (unit) {
        case 'd':
          totalMs += value * 24 * 60 * 60 * 1000;
          break;
        case 'h':
          totalMs += value * 60 * 60 * 1000;
          break;
        case 'm':
          totalMs += value * 60 * 1000;
          break;
        case 's':
          totalMs += value * 1000;
          break;
      }
    }

    if (totalMs > 0) {
      intervals.push(Math.floor(totalMs));
    }
  }

  return intervals;
}

/**
 * Parses timestamp string input (ISO 8601 or Unix timestamps)
 *
 * @param timestampString - Comma-separated timestamps
 * @returns Array of timestamps in milliseconds
 */
export function parseTimestampString(timestampString: string): number[] {
  const parts = timestampString.split(',').map((s) => s.trim());
  const timestamps: number[] = [];

  for (const part of parts) {
    // Try parsing as number (Unix timestamp)
    const numValue = parseFloat(part);
    if (!isNaN(numValue)) {
      // Assume seconds if < 10^12, otherwise milliseconds
      timestamps.push(
        numValue < 1e12 ? numValue * 1000 : numValue
      );
    } else {
      // Try parsing as ISO date
      const date = new Date(part);
      if (!isNaN(date.getTime())) {
        timestamps.push(date.getTime());
      }
    }
  }

  return timestamps;
}
