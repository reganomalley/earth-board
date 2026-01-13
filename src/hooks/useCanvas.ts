import { useState, useEffect } from 'react';
import { getActiveCanvas } from '../services/objectService';
import type { Canvas } from '../types/canvas.types';

/**
 * Hook to manage active canvas state
 * Fetches today's canvas on mount
 */
export function useCanvas() {
  const [canvas, setCanvas] = useState<Canvas | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCanvas();
  }, []);

  const loadCanvas = async () => {
    try {
      setLoading(true);
      const activeCanvas = await getActiveCanvas();
      if (activeCanvas) {
        setCanvas(activeCanvas);
      } else {
        setError('Failed to load canvas');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return {
    canvas,
    canvasId: canvas?.id,
    canvasDate: canvas?.date,
    theme: canvas?.theme,
    loading,
    error,
    reload: loadCanvas,
  };
}
