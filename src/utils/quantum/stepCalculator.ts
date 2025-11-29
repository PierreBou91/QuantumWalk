import type { QuantumStep, QuantumConfig } from '../../types/quantum';
import { hashTimestamp } from './hasher';
import { hashToDuration, MAX_INTERVAL_MS } from './durationConverter';

/**
 * Default configuration for the Quantum Walk
 */
export const DEFAULT_CONFIG: QuantumConfig = {
  maxInterval: MAX_INTERVAL_MS,
  startTimestamp: 0, // Unix Epoch
};

/**
 * Creates the initial step at Unix Epoch (timestamp 0)
 *
 * @returns Initial quantum step
 */
export async function getInitialStep(): Promise<QuantumStep> {
  const hash = await hashTimestamp(0);

  return {
    index: 0,
    timestamp: 0,
    interval: 0,
    hash,
    isoString: new Date(0).toISOString(),
  };
}

/**
 * Calculates the next step in the Quantum Walk sequence
 *
 * @param currentStep - Current step
 * @param config - Configuration (optional)
 * @returns Next quantum step
 */
export async function calculateNextStep(
  currentStep: QuantumStep,
  config: QuantumConfig = DEFAULT_CONFIG
): Promise<QuantumStep> {
  // Hash the current timestamp
  const hash = await hashTimestamp(currentStep.timestamp);

  // Convert hash to duration
  const interval = hashToDuration(hash, config.maxInterval);

  // Calculate next timestamp
  const nextTimestamp = currentStep.timestamp + interval;

  return {
    index: currentStep.index + 1,
    timestamp: nextTimestamp,
    interval,
    hash,
    isoString: new Date(nextTimestamp).toISOString(),
  };
}

/**
 * Calculates multiple steps forward from a starting step
 *
 * @param startStep - Starting step
 * @param count - Number of steps to calculate
 * @param config - Configuration (optional)
 * @returns Array of quantum steps
 */
export async function calculateStepsForward(
  startStep: QuantumStep,
  count: number,
  config: QuantumConfig = DEFAULT_CONFIG
): Promise<QuantumStep[]> {
  const steps: QuantumStep[] = [];
  let current = startStep;

  for (let i = 0; i < count; i++) {
    current = await calculateNextStep(current, config);
    steps.push(current);
  }

  return steps;
}

/**
 * Calculates steps until a target timestamp is reached or exceeded
 *
 * @param startStep - Starting step
 * @param targetTimestamp - Target timestamp to reach
 * @param config - Configuration (optional)
 * @returns Array of quantum steps up to the target
 */
export async function calculateStepsUntil(
  startStep: QuantumStep,
  targetTimestamp: number,
  config: QuantumConfig = DEFAULT_CONFIG
): Promise<QuantumStep[]> {
  const steps: QuantumStep[] = [];
  let current = startStep;

  while (current.timestamp < targetTimestamp) {
    current = await calculateNextStep(current, config);
    steps.push(current);

    // Safety check to prevent infinite loops
    if (steps.length > 1000000) {
      throw new Error('Maximum step limit exceeded (1,000,000 steps)');
    }
  }

  return steps;
}

/**
 * Finds the quantum step closest to a given timestamp
 *
 * @param targetTimestamp - Target timestamp
 * @param config - Configuration (optional)
 * @returns Closest quantum step
 */
export async function findStepNearTimestamp(
  targetTimestamp: number,
  config: QuantumConfig = DEFAULT_CONFIG
): Promise<QuantumStep> {
  let current = await getInitialStep();

  // Calculate steps until we reach or exceed the target
  while (current.timestamp < targetTimestamp) {
    const next = await calculateNextStep(current, config);

    // If next step would overshoot, return the closer of the two
    if (next.timestamp > targetTimestamp) {
      const currentDiff = Math.abs(targetTimestamp - current.timestamp);
      const nextDiff = Math.abs(targetTimestamp - next.timestamp);
      return currentDiff < nextDiff ? current : next;
    }

    current = next;
  }

  return current;
}

/**
 * Calculates steps in a date range
 *
 * @param startDate - Start date
 * @param endDate - End date
 * @param config - Configuration (optional)
 * @returns Array of quantum steps in the range
 */
export async function calculateStepsInRange(
  startDate: Date,
  endDate: Date,
  config: QuantumConfig = DEFAULT_CONFIG
): Promise<QuantumStep[]> {
  const startTimestamp = startDate.getTime();
  const endTimestamp = endDate.getTime();

  // Find the first step on or after the start date
  const firstStep = await findStepNearTimestamp(startTimestamp, config);

  // Calculate steps until end date
  const steps: QuantumStep[] = [firstStep];
  let current = firstStep;

  while (current.timestamp < endTimestamp) {
    current = await calculateNextStep(current, config);
    if (current.timestamp <= endTimestamp) {
      steps.push(current);
    }
  }

  return steps;
}

/**
 * Gets the current quantum step (closest to now)
 *
 * @param config - Configuration (optional)
 * @returns Current quantum step
 */
export async function getCurrentStep(
  config: QuantumConfig = DEFAULT_CONFIG
): Promise<QuantumStep> {
  return findStepNearTimestamp(Date.now(), config);
}

/**
 * Gets the next upcoming quantum step (first step after now)
 *
 * @param config - Configuration (optional)
 * @returns Next quantum step
 */
export async function getNextStep(
  config: QuantumConfig = DEFAULT_CONFIG
): Promise<QuantumStep> {
  const now = Date.now();
  let current = await getInitialStep();

  while (current.timestamp <= now) {
    current = await calculateNextStep(current, config);
  }

  return current;
}
