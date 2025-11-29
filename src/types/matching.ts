import type { QuantumStep } from './quantum';

/**
 * Result of a sequence alignment operation
 */
export interface SequenceAlignment {
  /** Offset in the quantum sequence where the best match starts */
  offset: number;
  /** Number of intervals matched */
  length: number;
  /** Aligned quantum steps */
  alignedSteps: QuantumStep[];
}

/**
 * Statistical metrics for sequence matching
 */
export interface MatchStatistics {
  /** Mean absolute error (milliseconds) */
  meanError: number;
  /** Standard deviation of errors */
  stdDeviation: number;
  /** Pearson correlation coefficient [-1, 1] */
  correlation: number;
  /** Root mean square error */
  rmse: number;
  /** Maximum individual error */
  maxError: number;
  /** Minimum individual error */
  minError: number;
}

/**
 * Complete result of a sequence matching operation
 */
export interface MatchResult {
  /** Overall similarity score [0, 1] where 1 is perfect match */
  similarityScore: number;
  /** Best alignment found */
  alignment: SequenceAlignment;
  /** Matched quantum steps */
  matchedSteps: QuantumStep[];
  /** Statistical metrics */
  statistics: MatchStatistics;
  /** User-provided intervals (milliseconds) */
  userIntervals: number[];
  /** Aligned quantum intervals (milliseconds) */
  quantumIntervals: number[];
}

/**
 * User input for sequence matching
 */
export interface UserSequenceInput {
  /** Input type */
  type: 'intervals' | 'timestamps';
  /** Raw input values (either intervals in ms or timestamps in ms) */
  values: number[];
  /** Date range to search within (optional) */
  searchRange?: {
    start: Date;
    end: Date;
  };
}
