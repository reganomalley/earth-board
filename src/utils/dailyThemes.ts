export interface DailyTheme {
  name: string;
  description: string;
  colors: string[];
  emoji: string;
}

export const DAILY_THEMES: Record<number, DailyTheme> = {
  0: {
    // Sunday
    name: 'cosmic sunday',
    description: 'draw the universe',
    colors: ['#000000', '#1a1f3a', '#643c96', '#8b5cf6', '#c4b5fd', '#FFFFFF'],
    emoji: '🌌',
  },
  1: {
    // Monday
    name: 'lunar monday',
    description: 'moonlit visions',
    colors: ['#0f172a', '#1e293b', '#475569', '#94a3b8', '#e2e8f0', '#f8fafc'],
    emoji: '🌙',
  },
  2: {
    // Tuesday
    name: 'underwater tuesday',
    description: 'ocean depths',
    colors: ['#0c4a6e', '#0369a1', '#0891b2', '#06b6d4', '#22d3ee', '#67e8f9'],
    emoji: '🌊',
  },
  3: {
    // Wednesday
    name: 'wild wednesday',
    description: 'untamed nature',
    colors: ['#14532d', '#15803d', '#16a34a', '#22c55e', '#4ade80', '#86efac'],
    emoji: '🌿',
  },
  4: {
    // Thursday
    name: 'golden thursday',
    description: 'radiant energy',
    colors: ['#713f12', '#a16207', '#ca8a04', '#eab308', '#facc15', '#fde047'],
    emoji: '✨',
  },
  5: {
    // Friday
    name: 'flame friday',
    description: 'burning passion',
    colors: ['#7f1d1d', '#991b1b', '#dc2626', '#f97316', '#fb923c', '#fdba74'],
    emoji: '🔥',
  },
  6: {
    // Saturday
    name: 'stellar saturday',
    description: 'among the stars',
    colors: ['#1e1b4b', '#4c1d95', '#7c3aed', '#a78bfa', '#c4b5fd', '#e9d5ff'],
    emoji: '⭐',
  },
};

/**
 * Get today's theme based on day of week
 */
export function getTodaysTheme(): DailyTheme {
  const day = new Date().getDay(); // 0 = Sunday, 1 = Monday, etc.
  return DAILY_THEMES[day];
}

/**
 * Get theme for a specific date
 */
export function getThemeForDate(date: Date | string): DailyTheme {
  const d = typeof date === 'string' ? new Date(date) : date;
  const day = d.getDay();
  return DAILY_THEMES[day];
}
