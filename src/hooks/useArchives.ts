import { useState, useEffect } from 'react';
import { getArchivedCanvases } from '../services/objectService';
import type { Canvas } from '../types/canvas.types';

/**
 * Hook to fetch and manage archived canvases
 */
export function useArchives() {
  const [archives, setArchives] = useState<Canvas[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadArchives();
  }, []);

  const loadArchives = async () => {
    try {
      setLoading(true);
      const archivedCanvases = await getArchivedCanvases();
      setArchives(archivedCanvases);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return {
    archives,
    loading,
    error,
    reload: loadArchives,
  };
}
