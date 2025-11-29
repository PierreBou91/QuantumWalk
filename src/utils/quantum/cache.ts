import type { QuantumStep, StepCacheEntry } from '../../types/quantum';

/**
 * In-memory cache for quantum steps
 * Stores recently computed steps to avoid recalculation
 */
export class StepCache {
  private cache: Map<number, StepCacheEntry>;
  private maxSize: number;
  private checkpoints: Map<number, QuantumStep>; // Store every Nth step

  constructor(maxSize: number = 10000, checkpointInterval: number = 1000) {
    this.cache = new Map();
    this.maxSize = maxSize;
    this.checkpoints = new Map();
  }

  /**
   * Gets a step from the cache by index
   */
  get(index: number): QuantumStep | undefined {
    const entry = this.cache.get(index);
    if (entry) {
      return entry.step;
    }
    return undefined;
  }

  /**
   * Gets a step from the cache by timestamp
   */
  getByTimestamp(timestamp: number): QuantumStep | undefined {
    for (const entry of this.cache.values()) {
      if (entry.step.timestamp === timestamp) {
        return entry.step;
      }
    }
    return undefined;
  }

  /**
   * Adds a step to the cache
   */
  set(step: QuantumStep): void {
    // If cache is full, remove oldest entries
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey !== undefined) {
        this.cache.delete(firstKey);
      }
    }

    this.cache.set(step.index, {
      step,
      timestamp: Date.now(),
    });

    // Store checkpoints (every 1000th step)
    if (step.index % 1000 === 0) {
      this.checkpoints.set(step.index, step);
    }
  }

  /**
   * Gets the nearest checkpoint before or at the given index
   */
  getNearestCheckpoint(targetIndex: number): QuantumStep | undefined {
    const checkpointIndex = Math.floor(targetIndex / 1000) * 1000;
    return this.checkpoints.get(checkpointIndex);
  }

  /**
   * Clears the cache
   */
  clear(): void {
    this.cache.clear();
    this.checkpoints.clear();
  }

  /**
   * Gets cache statistics
   */
  getStats(): {
    size: number;
    maxSize: number;
    checkpointCount: number;
  } {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      checkpointCount: this.checkpoints.size,
    };
  }
}

/**
 * Global cache instance
 */
export const globalStepCache = new StepCache();
