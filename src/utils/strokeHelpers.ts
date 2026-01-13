import getStroke from 'perfect-freehand';
import type { PenOptions } from '../types/canvas.types';

// Default options for perfect-freehand
export const DEFAULT_PEN_OPTIONS: PenOptions = {
  color: '#000000',
  size: 8,
  thinning: 0.5,
  smoothing: 0.5,
  streamline: 0.5,
};

/**
 * Generate smooth stroke points from raw input points using perfect-freehand
 * @param points Raw input points [[x, y, pressure], ...]
 * @param options Pen options (size, thinning, smoothing, streamline)
 * @returns Stroke outline points [[x, y], ...]
 */
export function generateStroke(
  points: number[][],
  options: Partial<PenOptions> = {}
): number[][] {
  const mergedOptions = { ...DEFAULT_PEN_OPTIONS, ...options };

  const stroke = getStroke(points, {
    size: mergedOptions.size,
    thinning: mergedOptions.thinning,
    smoothing: mergedOptions.smoothing,
    streamline: mergedOptions.streamline,
    simulatePressure: true, // Simulate pressure for mouse input
  });

  return stroke;
}

/**
 * Convert stroke points to SVG path string
 * @param points Stroke outline points
 * @returns SVG path string
 */
export function getSvgPathFromStroke(points: number[][]): string {
  if (!points.length) return '';

  const d = points.reduce(
    (acc, [x0, y0], i, arr) => {
      const [x1, y1] = arr[(i + 1) % arr.length];
      acc.push(x0, y0, (x0 + x1) / 2, (y0 + y1) / 2);
      return acc;
    },
    ['M', ...points[0], 'Q']
  );

  d.push('Z');
  return d.join(' ');
}

/**
 * Flatten stroke points for Konva Line component
 * [[x, y], [x, y]] → [x, y, x, y]
 * @param points Stroke outline points
 * @returns Flattened points array
 */
export function flattenPoints(points: number[][]): number[] {
  return points.flat();
}

/**
 * Calculate bounding box for stroke points
 * @param points Stroke outline points
 * @returns {x, y, width, height}
 */
export function getStrokeBounds(points: number[][]): {
  x: number;
  y: number;
  width: number;
  height: number;
} {
  if (!points.length) {
    return { x: 0, y: 0, width: 0, height: 0 };
  }

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  points.forEach(([x, y]) => {
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x);
    maxY = Math.max(maxY, y);
  });

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  };
}
