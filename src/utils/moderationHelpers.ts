/**
 * Basic content moderation for text input
 * Blocks common slurs, hate speech, and inappropriate content
 */

// Blocked terms - only hate speech, slurs, and extreme content
const BLOCKED_WORDS = [
  // Racial slurs
  'nigger', 'nigga', 'n1gger', 'n1gga', 'niqqa', 'niqqer',
  'chink', 'ch1nk',
  'kike', 'k1ke',
  'spic', 'sp1c',
  'wetback', 'w3tback',
  'beaner', 'b3aner',
  'coon', 'c00n',
  'gook', 'g00k',

  // Homophobic/transphobic slurs
  'faggot', 'fag', 'f4ggot', 'f4g', 'fagget',
  'tranny', 'tr4nny',

  // Ableist slurs
  'retard', 'retarded', 'r3tard',

  // Hate symbols
  'nazi', 'n4zi',
  'hitler', 'h1tler',
  'kkk', 'klan',

  // Extreme harmful content
  'kill yourself', 'kys',
  'rape', 'r4pe',
];

/**
 * Check if text contains blocked words
 */
export function containsInappropriateContent(text: string): boolean {
  const normalized = text.toLowerCase()
    .replace(/\s+/g, '') // Remove spaces
    .replace(/[^a-z0-9]/g, ''); // Remove special characters

  return BLOCKED_WORDS.some(word => {
    const normalizedWord = word.replace(/\s+/g, '').replace(/[^a-z0-9]/g, '');
    return normalized.includes(normalizedWord);
  });
}

/**
 * Sanitize and validate text input
 */
export function validateTextInput(text: string): { valid: boolean; message?: string } {
  // Check length
  if (text.length === 0) {
    return { valid: false, message: 'Text cannot be empty' };
  }

  if (text.length > 30) {
    return { valid: false, message: 'Text must be 30 characters or less' };
  }

  // Check for inappropriate content
  if (containsInappropriateContent(text)) {
    return { valid: false, message: 'This text contains inappropriate content' };
  }

  return { valid: true };
}
