/**
 * Timezone utilities for EST/EDT handling
 * All canvas dates should use EST timezone consistently
 */

/**
 * Get current date in EST timezone (YYYY-MM-DD format)
 * @returns Date string in EST timezone
 */
export function getESTDate(): string {
  const now = new Date();
  // EST is UTC-5, EDT is UTC-4
  // For simplicity, using UTC-5 (EST) year-round
  const estOffset = -5 * 60; // minutes
  const estTime = new Date(now.getTime() + (estOffset * 60 * 1000));
  return estTime.toISOString().split('T')[0];
}

/**
 * Convert a UTC Date to EST date string (YYYY-MM-DD format)
 * @param utcDate - Date object in UTC
 * @returns Date string in EST timezone
 */
export function toESTDate(utcDate: Date): string {
  const estOffset = -5 * 60; // minutes
  const estTime = new Date(utcDate.getTime() + (estOffset * 60 * 1000));
  return estTime.toISOString().split('T')[0];
}

/**
 * Check if a UTC timestamp falls on a specific EST date
 * @param utcTimestamp - UTC timestamp string (ISO 8601)
 * @param estDate - EST date string (YYYY-MM-DD)
 * @returns true if the timestamp is on that EST date
 */
export function isOnESTDate(utcTimestamp: string, estDate: string): boolean {
  const date = new Date(utcTimestamp);
  return toESTDate(date) === estDate;
}
