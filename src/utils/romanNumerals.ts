/**
 * Convert a number to Roman numerals
 */
export function toRoman(num: number): string {
  const romanNumerals: [number, string][] = [
    [1000, 'M'],
    [900, 'CM'],
    [500, 'D'],
    [400, 'CD'],
    [100, 'C'],
    [90, 'XC'],
    [50, 'L'],
    [40, 'XL'],
    [10, 'X'],
    [9, 'IX'],
    [5, 'V'],
    [4, 'IV'],
    [1, 'I'],
  ];

  let result = '';

  for (const [value, numeral] of romanNumerals) {
    while (num >= value) {
      result += numeral;
      num -= value;
    }
  }

  return result;
}

/**
 * Format a date as Roman numerals: MM.DD.YYYY
 * Example: 01.13.2026 -> I.XIII.MMXXVI
 */
export function dateToRoman(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;

  const month = toRoman(d.getMonth() + 1); // Months are 0-indexed
  const day = toRoman(d.getDate());
  const year = toRoman(d.getFullYear());

  return `${month}.${day}.${year}`;
}

/**
 * Generate a canvas name based on the date
 * @param date Date string (YYYY-MM-DD)
 * @param isFirstCanvas Whether this is the first canvas ever
 * @returns Canvas name
 */
export function getCanvasName(date: string, isFirstCanvas: boolean = false): string {
  if (isFirstCanvas) {
    return 'big bang';
  }

  const d = new Date(date);
  const dayOfYear = Math.floor((d.getTime() - new Date(d.getFullYear(), 0, 0).getTime()) / 86400000);

  return `day ${toRoman(dayOfYear)}`;
}
