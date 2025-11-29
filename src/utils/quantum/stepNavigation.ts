import type { QuantumStep } from '../../types/quantum';
import { getInitialStep, calculateNextStep, getCurrentStep } from './stepCalculator';

/**
 * Gets N previous steps before a target step
 * Works by calculating forward from epoch until we reach the target
 *
 * @param targetStep - The target step to get previous steps for
 * @param count - Number of previous steps to retrieve
 * @returns Array of previous steps (most recent first)
 */
export async function getPreviousSteps(
  targetStep: QuantumStep,
  count: number
): Promise<QuantumStep[]> {
  if (targetStep.index === 0) {
    return []; // No previous steps for the initial step
  }

  const startIndex = Math.max(0, targetStep.index - count);
  const steps: QuantumStep[] = [];

  // Calculate from epoch to target index
  let current = await getInitialStep();

  for (let i = 0; i < targetStep.index; i++) {
    current = await calculateNextStep(current);

    // Only keep the steps we need (last N steps)
    if (i >= startIndex) {
      steps.push(current);
    }
  }

  // Return in reverse order (most recent first)
  return steps.reverse();
}

/**
 * Gets N steps before the current step (based on current time)
 *
 * @param count - Number of previous steps to retrieve
 * @returns Array of previous steps (most recent first)
 */
export async function getCurrentPreviousSteps(count: number): Promise<QuantumStep[]> {
  const current = await getCurrentStep();
  return getPreviousSteps(current, count);
}

/**
 * Formats a date in UTC without using toUTCString (which shows GMT)
 *
 * @param timestamp - Unix timestamp in milliseconds
 * @returns Formatted UTC string
 */
export function formatUTC(timestamp: number): string {
  const date = new Date(timestamp);
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  const hours = String(date.getUTCHours()).padStart(2, '0');
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');
  const seconds = String(date.getUTCSeconds()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds} UTC`;
}
