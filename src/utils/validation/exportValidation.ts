/**
 * Validation utilities for export functionality
 */

export interface ValidationResult {
  isValid: boolean;
  fromIndex?: number;
  toIndex?: number;
  error?: string;
}

/**
 * Validates export range input
 * @param fromValue - From step index as string
 * @param toValue - To step index as string
 * @returns Validation result with parsed indices or error
 */
export function validateExportRange(
  fromValue: string,
  toValue: string
): ValidationResult {
  const fromIndex = parseInt(fromValue || '0');
  const toIndex = parseInt(toValue || '100');

  // Validate non-negative indices
  if (fromIndex < 0 || toIndex < 0) {
    return {
      isValid: false,
      error: 'Please enter valid step indices (>= 0)'
    };
  }

  // Validate range order
  if (fromIndex > toIndex) {
    return {
      isValid: false,
      error: 'From index must be less than or equal to To index'
    };
  }

  // Warn for large exports
  if (toIndex - fromIndex > 10000) {
    const confirmed = window.confirm(
      'You are about to export more than 10,000 steps. This may take a while. Continue?'
    );
    if (!confirmed) {
      return { isValid: false };
    }
  }

  return { isValid: true, fromIndex, toIndex };
}

/**
 * Manages loading state for export buttons
 */
export class ExportButtonManager {
  constructor(
    private jsonButton: HTMLButtonElement | null,
    private csvButton: HTMLButtonElement | null,
    private loadingElement: HTMLElement | null
  ) {}

  showLoading(): void {
    this.loadingElement?.classList.remove('hidden');
    if (this.jsonButton) this.jsonButton.disabled = true;
    if (this.csvButton) this.csvButton.disabled = true;
  }

  hideLoading(): void {
    this.loadingElement?.classList.add('hidden');
    if (this.jsonButton) this.jsonButton.disabled = false;
    if (this.csvButton) this.csvButton.disabled = false;
  }
}
