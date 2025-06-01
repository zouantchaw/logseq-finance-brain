/**
 * Type conversion and validation utilities
 */

/**
 * Safely parse a string to number with validation
 */
export function parseAmount(value: string | number | undefined): number {
  if (value === undefined || value === null || value === "") {
    return 0;
  }

  if (typeof value === "number") {
    return value;
  }

  // Remove currency symbols and commas
  const cleaned = value.replace(/[$,]/g, "").trim();

  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Parse date string to Date object
 */
export function parseDate(value: string | Date | undefined): Date {
  if (!value) {
    return new Date();
  }

  if (value instanceof Date) {
    return value;
  }

  const parsed = new Date(value);
  return isNaN(parsed.getTime()) ? new Date() : parsed;
}

/**
 * Format number as currency
 */
export function formatCurrency(
  amount: number,
  currency: string = "USD"
): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
  }).format(amount);
}

/**
 * Format date for display
 */
export function formatDate(date: Date, format: string = "YYYY-MM-DD"): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return format
    .replace("YYYY", String(year))
    .replace("MM", month)
    .replace("DD", day);
}

/**
 * Validate account type
 */
export function isValidAccountType(
  type: string
): type is "checking" | "savings" | "credit-card" {
  return ["checking", "savings", "credit-card"].includes(type);
}

/**
 * Validate investment account type
 */
export function isValidInvestmentAccountType(
  type: string
): type is
  | "brokerage"
  | "retirement"
  | "401k"
  | "roth-ira"
  | "traditional-ira" {
  return [
    "brokerage",
    "retirement",
    "401k",
    "roth-ira",
    "traditional-ira",
  ].includes(type);
}

/**
 * Validate transaction type
 */
export function isValidTransactionType(
  type: string
): type is "expense" | "income" | "investment" {
  return ["expense", "income", "investment"].includes(type);
}

/**
 * Clean and validate page reference
 */
export function cleanPageReference(ref: string): string {
  // Remove [[ ]] if present
  return ref.replace(/^\[\[|\]\]$/g, "");
}

/**
 * Format percentage
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Calculate percentage change
 */
export function calculatePercentageChange(
  current: number,
  previous: number
): number {
  if (previous === 0) {
    return current > 0 ? 100 : 0;
  }
  return ((current - previous) / previous) * 100;
}

/**
 * Parse percentage string to number
 */
export function parsePercentage(value: string | number | undefined): number {
  if (value === undefined || value === null || value === "") {
    return 0;
  }

  if (typeof value === "number") {
    return value;
  }

  // Remove % symbol if present
  const cleaned = value.replace(/%/g, "").trim();
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Validate and clean merchant/institution names
 */
export function cleanMerchantName(name: string): string {
  return name
    .trim()
    .replace(/\s+/g, " ") // Normalize whitespace
    .replace(/[^\w\s\-&.']/g, ""); // Remove special characters except common ones
}

/**
 * Extract month from date for grouping
 */
export function getMonthKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

/**
 * Get date range for period calculations
 */
export function getDateRange(
  period: "month" | "quarter" | "year",
  offset: number = 0
): { start: Date; end: Date } {
  const now = new Date();
  const start = new Date(now);
  const end = new Date(now);

  switch (period) {
    case "month":
      start.setMonth(start.getMonth() - offset);
      start.setDate(1);
      end.setMonth(end.getMonth() - offset + 1);
      end.setDate(0);
      break;
    case "quarter":
      const currentQuarter = Math.floor(now.getMonth() / 3);
      start.setMonth((currentQuarter - offset) * 3);
      start.setDate(1);
      end.setMonth((currentQuarter - offset + 1) * 3);
      end.setDate(0);
      break;
    case "year":
      start.setFullYear(start.getFullYear() - offset);
      start.setMonth(0);
      start.setDate(1);
      end.setFullYear(end.getFullYear() - offset);
      end.setMonth(11);
      end.setDate(31);
      break;
  }

  // Set to beginning and end of day
  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);

  return { start, end };
}
