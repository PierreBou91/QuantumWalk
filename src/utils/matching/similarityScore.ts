import type { MatchStatistics } from '../../types/matching';

/**
 * Calculates the Pearson correlation coefficient between two sequences
 *
 * @param x - First sequence
 * @param y - Second sequence
 * @returns Correlation coefficient [-1, 1]
 */
export function pearsonCorrelation(x: number[], y: number[]): number {
  const n = Math.min(x.length, y.length);
  if (n === 0) return 0;

  const meanX = x.slice(0, n).reduce((sum, val) => sum + val, 0) / n;
  const meanY = y.slice(0, n).reduce((sum, val) => sum + val, 0) / n;

  let numerator = 0;
  let sumSqX = 0;
  let sumSqY = 0;

  for (let i = 0; i < n; i++) {
    const dx = x[i] - meanX;
    const dy = y[i] - meanY;
    numerator += dx * dy;
    sumSqX += dx * dx;
    sumSqY += dy * dy;
  }

  const denominator = Math.sqrt(sumSqX * sumSqY);
  return denominator === 0 ? 0 : numerator / denominator;
}

/**
 * Calculates statistical metrics for sequence matching
 *
 * @param userIntervals - User-provided intervals
 * @param quantumIntervals - Aligned quantum intervals
 * @returns Match statistics
 */
export function calculateStatistics(
  userIntervals: number[],
  quantumIntervals: number[]
): MatchStatistics {
  const n = Math.min(userIntervals.length, quantumIntervals.length);
  const errors: number[] = [];

  for (let i = 0; i < n; i++) {
    errors.push(Math.abs(userIntervals[i] - quantumIntervals[i]));
  }

  const meanError = errors.reduce((sum, e) => sum + e, 0) / n;
  const maxError = Math.max(...errors);
  const minError = Math.min(...errors);

  // Standard deviation
  const variance =
    errors.reduce((sum, e) => sum + Math.pow(e - meanError, 2), 0) / n;
  const stdDeviation = Math.sqrt(variance);

  // Root mean square error
  const rmse = Math.sqrt(
    errors.reduce((sum, e) => sum + e * e, 0) / n
  );

  // Correlation
  const correlation = pearsonCorrelation(userIntervals, quantumIntervals);

  return {
    meanError,
    stdDeviation,
    correlation,
    rmse,
    maxError,
    minError,
  };
}

/**
 * Calculates overall similarity score using hybrid approach
 *
 * Combines:
 * 1. Ratio-based similarity (scale-independent)
 * 2. Normalized absolute difference
 * 3. Pearson correlation coefficient
 *
 * @param userIntervals - User-provided intervals (milliseconds)
 * @param quantumIntervals - Aligned quantum intervals (milliseconds)
 * @param maxInterval - Maximum possible interval (default: 7 days)
 * @returns Similarity score [0, 1] where 1 is perfect match
 */
export function calculateSimilarity(
  userIntervals: number[],
  quantumIntervals: number[],
  maxInterval: number = 7 * 24 * 60 * 60 * 1000
): number {
  const n = Math.min(userIntervals.length, quantumIntervals.length);
  if (n === 0) return 0;

  // 1. Ratio-based similarity (min/max for each pair)
  let ratioSum = 0;
  for (let i = 0; i < n; i++) {
    const u = userIntervals[i];
    const q = quantumIntervals[i];
    if (u === 0 && q === 0) {
      ratioSum += 1;
    } else {
      ratioSum += Math.min(u, q) / Math.max(u, q);
    }
  }
  const ratioScore = ratioSum / n;

  // 2. Normalized error score
  const meanError =
    userIntervals.reduce(
      (sum, u, i) => sum + Math.abs(u - quantumIntervals[i]),
      0
    ) / n;
  const errorScore = Math.max(0, 1 - meanError / maxInterval);

  // 3. Correlation score (normalized to [0, 1])
  const correlation = pearsonCorrelation(userIntervals, quantumIntervals);
  const corrScore = (correlation + 1) / 2;

  // Weighted combination
  // Ratio: 50% (most important for scale-independent matching)
  // Error: 30% (absolute accuracy)
  // Correlation: 20% (pattern similarity)
  const finalScore = 0.5 * ratioScore + 0.3 * errorScore + 0.2 * corrScore;

  return Math.max(0, Math.min(1, finalScore));
}

/**
 * Converts a similarity score to a human-readable quality rating
 *
 * @param score - Similarity score [0, 1]
 * @returns Quality rating and description
 */
export function getMatchQuality(score: number): {
  rating: string;
  description: string;
  color: string;
} {
  if (score >= 0.95) {
    return {
      rating: 'Exceptional',
      description: 'Near-perfect match',
      color: 'text-green-400',
    };
  } else if (score >= 0.85) {
    return {
      rating: 'Excellent',
      description: 'Very strong match',
      color: 'text-cosmic-purple',
    };
  } else if (score >= 0.7) {
    return {
      rating: 'Good',
      description: 'Strong correlation',
      color: 'text-cosmic-blue',
    };
  } else if (score >= 0.5) {
    return {
      rating: 'Moderate',
      description: 'Some similarity',
      color: 'text-yellow-400',
    };
  } else if (score >= 0.3) {
    return {
      rating: 'Weak',
      description: 'Low correlation',
      color: 'text-orange-400',
    };
  } else {
    return {
      rating: 'Poor',
      description: 'No significant match',
      color: 'text-red-400',
    };
  }
}
