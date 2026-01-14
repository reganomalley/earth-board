import { supabase } from './supabase';
import { getSessionId } from '../utils/sessionManager';
import { dateToRoman } from '../utils/romanNumerals';
import { getESTDate } from '../utils/timezoneUtils';
import type { CanvasObject } from '../types/canvas.types';

/**
 * Fetch all objects for a specific canvas
 * @param canvasId UUID of the canvas
 * @returns Array of canvas objects
 */
export const fetchCanvasObjects = async (canvasId: string): Promise<CanvasObject[]> => {
  try {
    const { data, error } = await supabase
      .from('canvas_objects')
      .select('*')
      .eq('canvas_id', canvasId)
      .order('z_index', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching canvas objects:', error);
    return [];
  }
};

/**
 * Create a new canvas object
 * @param canvasId UUID of the canvas
 * @param object Object data (type, data, style, transform)
 * @returns Created object with ID
 */
export const createCanvasObject = async (
  canvasId: string,
  object: Omit<CanvasObject, 'id' | 'canvas_id' | 'created_by' | 'created_at'>
): Promise<{ success: boolean; data?: CanvasObject; error?: string }> => {
  try {
    const sessionId = getSessionId();

    const { data, error } = await supabase
      .from('canvas_objects')
      .insert({
        canvas_id: canvasId,
        created_by: sessionId,
        ...object,
      })
      .select()
      .single();

    if (error) throw error;

    return { success: true, data };
  } catch (error: any) {
    console.error('Error creating canvas object:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Update an existing canvas object
 * @param objectId UUID of the object
 * @param updates Partial object data to update
 * @returns Success status
 */
export const updateCanvasObject = async (
  objectId: string,
  updates: Partial<CanvasObject>
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase
      .from('canvas_objects')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', objectId);

    if (error) throw error;

    return { success: true };
  } catch (error: any) {
    console.error('Error updating canvas object:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Delete a canvas object
 * @param objectId UUID of the object
 * @returns Success status
 */
export const deleteCanvasObject = async (
  objectId: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase
      .from('canvas_objects')
      .delete()
      .eq('id', objectId);

    if (error) throw error;

    return { success: true };
  } catch (error: any) {
    console.error('Error deleting canvas object:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get the active canvas for today
 * @returns Active canvas or null
 */
export const getActiveCanvas = async () => {
  try {
    // Use EST timezone for canvas dates
    const todayDateEST = getESTDate();

    const { data, error } = await supabase
      .from('canvases')
      .select('*')
      .eq('status', 'active')
      .eq('date', todayDateEST)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
      throw error;
    }

    // If no canvas exists for today, create one
    if (!data) {
      // Check if this is the very first canvas
      const { count } = await supabase
        .from('canvases')
        .select('*', { count: 'exact', head: true });

      const isFirstCanvas = (count || 0) === 0;

      // Generate canvas name: "the big bang" for first, or Roman numeral date (I.XIV.MMXXVI)
      const canvasName = isFirstCanvas ? 'the big bang' : dateToRoman(todayDateEST);

      const { data: newCanvas, error: createError } = await supabase
        .from('canvases')
        .insert({
          date: todayDateEST,
          name: canvasName,
          status: 'active',
        })
        .select()
        .single();

      if (createError) throw createError;
      return newCanvas;
    }

    return data;
  } catch (error) {
    console.error('Error getting active canvas:', error);
    return null;
  }
};

/**
 * Get all archived canvases
 * @returns Array of archived canvases sorted by date descending
 */
export const getArchivedCanvases = async () => {
  try {
    const { data, error } = await supabase
      .from('canvases')
      .select('*')
      .eq('status', 'archived')
      .order('date', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching archived canvases:', error);
    return [];
  }
};

/**
 * Upload a canvas snapshot image to Supabase Storage
 * @param canvasId UUID of the canvas
 * @param blob Image blob (PNG)
 * @returns Public URL of the uploaded image or null if failed
 */
export const uploadCanvasSnapshot = async (
  canvasId: string,
  blob: Blob
): Promise<string | null> => {
  try {
    const fileName = `${canvasId}.png`;

    // Upload to Supabase Storage
    const { data, error: uploadError } = await supabase.storage
      .from('canvas-previews')
      .upload(fileName, blob, {
        upsert: true, // Overwrite if exists
        contentType: 'image/png',
      });

    if (uploadError) {
      console.error('Error uploading snapshot:', uploadError);
      return null;
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('canvas-previews')
      .getPublicUrl(fileName);

    const publicUrl = urlData.publicUrl;

    // Update canvas with snapshot URL
    const { error: updateError } = await supabase
      .from('canvases')
      .update({ snapshot_url: publicUrl })
      .eq('id', canvasId);

    if (updateError) {
      console.error('Error updating canvas with snapshot URL:', updateError);
      return null;
    }

    console.log(`Uploaded snapshot for canvas ${canvasId}: ${publicUrl}`);

    return publicUrl;
  } catch (error) {
    console.error('Error in uploadCanvasSnapshot:', error);
    return null;
  }
};
