// r/place-inspired 16-color palette
export const COLORS = [
  '#FFFFFF', // White
  '#E4E4E4', // Light gray
  '#888888', // Gray
  '#222222', // Dark gray
  '#FFA7D1', // Pink
  '#E50000', // Red
  '#E59500', // Orange
  '#A06A42', // Brown
  '#E5D900', // Yellow
  '#94E044', // Light green
  '#02BE01', // Green
  '#00D3DD', // Cyan
  '#0083C7', // Blue
  '#0000EA', // Dark blue
  '#CF6EE4', // Purple
  '#820080', // Dark purple
];

export const COLOR_NAMES = [
  'White',
  'Light Gray',
  'Gray',
  'Dark Gray',
  'Pink',
  'Red',
  'Orange',
  'Brown',
  'Yellow',
  'Light Green',
  'Green',
  'Cyan',
  'Blue',
  'Dark Blue',
  'Purple',
  'Dark Purple',
];

export const getColorIndex = (hexColor) => {
  return COLORS.indexOf(hexColor.toUpperCase());
};

export const getColorHex = (index) => {
  return COLORS[index] || COLORS[0];
};
