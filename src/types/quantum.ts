/**
 * Represents a single step in the Quantum Walk sequence
 */
export interface QuantumStep {
  /** 0-based step index in the sequence */
  index: number;
  /** Unix timestamp in milliseconds */
  timestamp: number;
  /** Duration from previous step in milliseconds */
  interval: number;
  /** SHA-256 hash of the timestamp (hex string) */
  hash: string;
  /** ISO 8601 formatted date string */
  isoString: string;
  /** Optional local timezone formatted string (client-side only) */
  localString?: string;
}

/**
 * Configuration for the Quantum Walk algorithm
 */
export interface QuantumConfig {
  /** Maximum interval duration in milliseconds (default: 7 days) */
  maxInterval: number;
  /** Starting timestamp (default: Unix Epoch 0) */
  startTimestamp: number;
}

/**
 * Represents a range of quantum steps
 */
export interface StepRange {
  /** Starting step (inclusive) */
  start: QuantumStep;
  /** Ending step (inclusive) */
  end: QuantumStep;
  /** All steps in the range */
  steps: QuantumStep[];
  /** Total number of steps */
  count: number;
}

/**
 * Cache entry for memoized step calculations
 */
export interface StepCacheEntry {
  step: QuantumStep;
  timestamp: number; // When this entry was cached
}
