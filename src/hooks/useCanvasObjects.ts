import { useState, useEffect, useCallback } from 'react';
import {
  fetchCanvasObjects,
  createCanvasObject,
  updateCanvasObject,
  deleteCanvasObject,
} from '../services/objectService';
import type { CanvasObject } from '../types/canvas.types';

/**
 * Hook to manage canvas objects CRUD operations
 * @param canvasId UUID of the active canvas
 */
export function useCanvasObjects(canvasId: string | undefined) {
  const [objects, setObjects] = useState<CanvasObject[]>([]);
  const [loading, setLoading] = useState(true);

  // Load objects when canvas ID changes
  useEffect(() => {
    if (canvasId) {
      loadObjects();
    }
  }, [canvasId]);

  const loadObjects = async () => {
    if (!canvasId) return;

    setLoading(true);
    const fetchedObjects = await fetchCanvasObjects(canvasId);
    setObjects(fetchedObjects);
    setLoading(false);
  };

  // Add a new object
  const addObject = useCallback(
    async (object: Omit<CanvasObject, 'id' | 'canvas_id' | 'created_by' | 'created_at'>) => {
      if (!canvasId) return null;

      const result = await createCanvasObject(canvasId, object);
      if (result.success && result.data) {
        setObjects((prev) => [...prev, result.data!]);
        return result.data;
      }
      return null;
    },
    [canvasId]
  );

  // Update an existing object (for local state management)
  const updateObject = useCallback((updatedObject: CanvasObject) => {
    setObjects((prev) =>
      prev.map((obj) => (obj.id === updatedObject.id ? updatedObject : obj))
    );
  }, []);

  // Update object in database
  const saveObjectUpdate = useCallback(async (objectId: string, updates: Partial<CanvasObject>) => {
    const result = await updateCanvasObject(objectId, updates);
    if (result.success) {
      setObjects((prev) =>
        prev.map((obj) => (obj.id === objectId ? { ...obj, ...updates } : obj))
      );
    }
    return result;
  }, []);

  // Remove an object
  const removeObject = useCallback(async (objectId: string) => {
    const result = await deleteCanvasObject(objectId);
    if (result.success) {
      setObjects((prev) => prev.filter((obj) => obj.id !== objectId));
    }
    return result;
  }, []);

  return {
    objects,
    loading,
    addObject,
    updateObject,
    saveObjectUpdate,
    removeObject,
    reload: loadObjects,
  };
}
