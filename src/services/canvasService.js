import { supabase } from './supabase';
import { getSessionId } from '../utils/sessionManager';

/**
 * Fetch all pixels from the canvas
 * @returns {Promise<Array>} Array of pixel objects {x, y, color}
 */
export const fetchCanvasPixels = async () => {
  try {
    const { data, error } = await supabase
      .from('canvas_pixels')
      .select('x, y, color');

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching canvas pixels:', error);
    return [];
  }
};

/**
 * Place a pixel on the canvas
 * @param {number} x - X coordinate (0-99)
 * @param {number} y - Y coordinate (0-99)
 * @param {number} color - Color index (0-15)
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const placePixel = async (x, y, color) => {
  try {
    const sessionId = getSessionId();

    // Upsert pixel (insert or update if exists)
    const { error } = await supabase
      .from('canvas_pixels')
      .upsert({
        x,
        y,
        color,
        placed_by: sessionId,
        placed_at: new Date().toISOString(),
      }, {
        onConflict: 'x,y', // Update if pixel already exists at this position
      });

    if (error) throw error;

    // Log to history
    await supabase
      .from('pixel_history')
      .insert({
        x,
        y,
        color,
        session_id: sessionId,
        placed_at: new Date().toISOString(),
      });

    return { success: true };
  } catch (error) {
    console.error('Error placing pixel:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Check if user can place a pixel (cooldown check)
 * @returns {Promise<{canPlace: boolean, timeLeft: number}>}
 */
export const checkCooldown = async () => {
  try {
    const sessionId = getSessionId();

    const { data, error } = await supabase
      .from('user_cooldowns')
      .select('last_placement')
      .eq('session_id', sessionId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
      throw error;
    }

    if (!data || !data.last_placement) {
      return { canPlace: true, timeLeft: 0 };
    }

    const lastPlacement = new Date(data.last_placement);
    const now = new Date();
    const cooldownMs = 30000; // 30 seconds
    const timeSinceLastPlacement = now - lastPlacement;
    const timeLeft = Math.max(0, cooldownMs - timeSinceLastPlacement);

    return {
      canPlace: timeLeft === 0,
      timeLeft: Math.ceil(timeLeft / 1000), // Convert to seconds
    };
  } catch (error) {
    console.error('Error checking cooldown:', error);
    return { canPlace: true, timeLeft: 0 }; // Fail open
  }
};

/**
 * Update user cooldown after placing a pixel
 */
export const updateCooldown = async () => {
  try {
    const sessionId = getSessionId();

    await supabase
      .from('user_cooldowns')
      .upsert({
        session_id: sessionId,
        last_placement: new Date().toISOString(),
      }, {
        onConflict: 'session_id',
      });
  } catch (error) {
    console.error('Error updating cooldown:', error);
  }
};
